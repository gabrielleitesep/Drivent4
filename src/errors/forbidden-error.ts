import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "forbiddenError",
    message: "Forbidden access!",
  };
}
