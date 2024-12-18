// soon for complex agents
export default abstract class AgentServer {
  actions: Record<string, (...args: any) => void> = {};
  callAction(action: string, data?: any) {
    if (!this.actions[action]) {
      throw new Error(`Action ${action} not found`);
    }
    return this.actions[action](data);
  }
}
