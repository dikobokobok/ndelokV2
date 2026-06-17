package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

var (
	metricsMu sync.Mutex

	prevCPUTimes cpu.TimesStat
	prevCPUOk    bool

	prevNetStat net.IOCountersStat
	prevNetOk   bool
	prevNetTime time.Time
)

type MetricsResponse struct {
	CPU         float64 `json:"cpu"`
	RAM         float64 `json:"ram"`
	Storage     float64 `json:"storage"`
	CPUInfo     string  `json:"cpu_info"`
	RAMInfo     string  `json:"ram_info"`
	StorageInfo string  `json:"storage_info"`
	Network     struct {
		Up   float64 `json:"up"`
		Down float64 `json:"down"`
	} `json:"network"`
}

func Metrics(w http.ResponseWriter, r *http.Request) {
	metricsMu.Lock()
	defer metricsMu.Unlock()

	resp := MetricsResponse{}

	// RAM
	if v, err := mem.VirtualMemory(); err == nil {
		resp.RAM = v.UsedPercent
		usedGB := float64(v.Used) / (1024 * 1024 * 1024)
		totalGB := float64(v.Total) / (1024 * 1024 * 1024)
		resp.RAMInfo = fmt.Sprintf("%.1fGB / %.0fGB", usedGB, totalGB)
	}

	// Storage
	if v, err := disk.Usage(storageRoot()); err == nil {
		resp.Storage = v.UsedPercent
		usedGB := float64(v.Used) / (1024 * 1024 * 1024)
		totalGB := float64(v.Total) / (1024 * 1024 * 1024)
		if totalGB >= 1000 {
			resp.StorageInfo = fmt.Sprintf("%.1fTB / %.1fTB", usedGB/1024.0, totalGB/1024.0)
		} else {
			resp.StorageInfo = fmt.Sprintf("%.0fGB / %.0fGB", usedGB, totalGB)
		}
	}

	// CPU — delta from previous call
	if times, err := cpu.Times(false); err == nil && len(times) > 0 {
		t := times[0]
		if prevCPUOk {
			total := (t.User + t.System + t.Idle + t.Nice + t.Iowait + t.Irq + t.Softirq + t.Steal + t.Guest + t.GuestNice) -
				(prevCPUTimes.User + prevCPUTimes.System + prevCPUTimes.Idle + prevCPUTimes.Nice + prevCPUTimes.Iowait + prevCPUTimes.Irq + prevCPUTimes.Softirq + prevCPUTimes.Steal + prevCPUTimes.Guest + prevCPUTimes.GuestNice)
			idle := t.Idle - prevCPUTimes.Idle
			if total > 0 {
				resp.CPU = (1 - float64(idle)/float64(total)) * 100
			}
		}
		prevCPUTimes = t
		prevCPUOk = true
	}
	if infos, err := cpu.Info(); err == nil && len(infos) > 0 {
		resp.CPUInfo = infos[0].ModelName
	} else {
		resp.CPUInfo = "Unknown CPU"
	}

	// Network — bytes delta per second
	if counters, err := net.IOCounters(false); err == nil && len(counters) > 0 {
		c := counters[0]
		if prevNetOk {
			elapsed := time.Since(prevNetTime).Seconds()
			if elapsed > 0 {
				resp.Network.Up = float64(c.BytesSent-prevNetStat.BytesSent) / elapsed
				resp.Network.Down = float64(c.BytesRecv-prevNetStat.BytesRecv) / elapsed
			}
		}
		prevNetStat = c
		prevNetOk = true
		prevNetTime = time.Now()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func storageRoot() string {
	if runtime.GOOS == "windows" {
		return "C:\\"
	}
	return "/"
}
