// Terminal service — extend this module as terminal features are added.
//
// Suggested additions:
//   - spawn_shell(cwd: &str) -> AppResult<u32>   (returns PID)
//   - send_input(pid: u32, input: &str) -> AppResult<()>
//   - kill_shell(pid: u32) -> AppResult<()>
 