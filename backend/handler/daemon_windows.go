//go:build windows

package handler

import (
	"os/exec"
	"strconv"
)

// setDaemonAttrs is a no-op on Windows (no process group concept).
func setDaemonAttrs(_ *exec.Cmd) {}

// killProcess terminates the process and all its children on Windows.
func killProcess(pid int) {
	_ = exec.Command("taskkill", "/F", "/T", "/PID", strconv.Itoa(pid)).Run()
}
