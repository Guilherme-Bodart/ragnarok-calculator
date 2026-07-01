import {
  migrateCalculatorBuildPayload,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type CalculatorAccountBuild = {
  id: string;
  name: string;
  classId: string;
  payload: CalculatorBuildPayload;
  createdAt: string;
  updatedAt: string;
};

export async function listCalculatorAccountBuilds() {
  const response = await fetch(`${apiBaseUrl}/calculator/builds`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return { status: "unauthenticated" as const, builds: [] };
  }

  if (!response.ok) {
    throw new Error("Failed to load calculator builds.");
  }

  const data = (await response.json()) as { builds?: unknown[] };

  return {
    status: "authenticated" as const,
    builds: (data.builds ?? [])
      .map(toAccountBuild)
      .filter((build): build is CalculatorAccountBuild => Boolean(build)),
  };
}

export async function saveCalculatorAccountBuild(payload: CalculatorBuildPayload) {
  const response = await fetch(`${apiBaseUrl}/calculator/builds`, {
    body: JSON.stringify({
      classId: payload.character.selectedClassId,
      name: payload.name,
      payload,
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || "Failed to save calculator build.");
  }

  const data = (await response.json()) as { build?: unknown };
  const build = toAccountBuild(data.build);

  if (!build) {
    throw new Error("Invalid calculator build response.");
  }

  return build;
}

export async function updateCalculatorAccountBuild(
  buildId: string,
  payload: CalculatorBuildPayload,
) {
  const response = await fetch(`${apiBaseUrl}/calculator/builds/${buildId}`, {
    body: JSON.stringify({
      classId: payload.character.selectedClassId,
      name: payload.name,
      payload,
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || "Failed to update calculator build.");
  }

  const data = (await response.json()) as { build?: unknown };
  const build = toAccountBuild(data.build);

  if (!build) {
    throw new Error("Invalid calculator build response.");
  }

  return build;
}

export async function deleteCalculatorAccountBuild(buildId: string) {
  const response = await fetch(`${apiBaseUrl}/calculator/builds/${buildId}`, {
    credentials: "include",
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete calculator build.");
  }
}

function toAccountBuild(value: unknown): CalculatorAccountBuild | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const build = value as {
    classId?: unknown;
    createdAt?: unknown;
    id?: unknown;
    name?: unknown;
    payloadJson?: unknown;
    updatedAt?: unknown;
  };

  const payload = migrateCalculatorBuildPayload(build.payloadJson);

  if (
    typeof build.id !== "string" ||
    typeof build.name !== "string" ||
    typeof build.classId !== "string" ||
    typeof build.createdAt !== "string" ||
    typeof build.updatedAt !== "string" ||
    !payload
  ) {
    return null;
  }

  return {
    classId: build.classId,
    createdAt: build.createdAt,
    id: build.id,
    name: build.name,
    payload,
    updatedAt: build.updatedAt,
  };
}
