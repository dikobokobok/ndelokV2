//go:build !windows

package handler

import "os/exec"

// shellCommand wraps a shell string command for Unix systems.
func shellCommand(command string) *exec.Cmd {
	return exec.Command("sh", "-c", command)
}
