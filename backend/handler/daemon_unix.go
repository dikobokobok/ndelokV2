//go:build !windows

package handler

import (
	"os/exec"
	"syscall"
)

// setDaemonAttrs configures the command to run in its own process group
// so we can kill children when the parent is killed (Linux/macOS).
func setDaemonAttrs(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

// killProcess terminates the process group (process and all its children) on Unix.
func killProcess(pid int) {
	_ = syscall.Kill(-pid, syscall.SIGKILL)
}
