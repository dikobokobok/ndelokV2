//go:build windows

package handler

import "os/exec"

// shellCommand wraps a shell string command for Windows systems.
func shellCommand(command string) *exec.Cmd {
	return exec.Command("cmd", "/C", command)
}
