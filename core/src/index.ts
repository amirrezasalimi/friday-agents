import ChartAgent from "./agents/chart";
import JsCodeAgent from "./agents/js-code";
import SearchAgent from "./agents/search";
import FridayAgent from "./core";

// Export the base Agent class and types

// Export all types
export type {
  FinalResponse,
  ReasoningAndTools
} from './types';

// Create the main export object that includes all agents
const FridayAgents = {
  FridayAgent,
  JsCodeAgent,
  SearchAgent,
  ChartAgent
};

// Also export individual agents and types
export {
  FridayAgent,
  JsCodeAgent,
  SearchAgent,
  ChartAgent
};

// Export default
export default FridayAgents;