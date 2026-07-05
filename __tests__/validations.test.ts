import { describe, it, expect } from "vitest";
import {
  componentStatusEnum,
  incidentStatusEnum,
  incidentImpactEnum,
  maintenanceStatusEnum,
  createComponentSchema,
  updateComponentSchema,
  createIncidentSchema,
  addIncidentUpdateSchema,
  updateIncidentSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  createPageSchema,
  updatePageSchema,
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  subscribeSchema,
  formDataToObject,
  parseFormData,
} from "@/lib/validations";

// ── Enums ──

describe("componentStatusEnum", () => {
  const valid = ["operational", "degraded", "partial_outage", "major_outage", "maintenance"];

  it.each(valid)("accepts '%s'", (v) => {
    expect(componentStatusEnum.parse(v)).toBe(v);
  });

  it("rejects unknown value", () => {
    expect(() => componentStatusEnum.parse("offline")).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => componentStatusEnum.parse("")).toThrow();
  });
});

describe("incidentStatusEnum", () => {
  const valid = ["investigating", "identified", "monitoring", "resolved"];

  it.each(valid)("accepts '%s'", (v) => {
    expect(incidentStatusEnum.parse(v)).toBe(v);
  });

  it("rejects unknown value", () => {
    expect(() => incidentStatusEnum.parse("closed")).toThrow();
  });
});

describe("incidentImpactEnum", () => {
  const valid = ["none", "minor", "major", "critical"];

  it.each(valid)("accepts '%s'", (v) => {
    expect(incidentImpactEnum.parse(v)).toBe(v);
  });

  it("rejects unknown value", () => {
    expect(() => incidentImpactEnum.parse("low")).toThrow();
  });
});

describe("maintenanceStatusEnum", () => {
  const valid = ["scheduled", "in_progress", "completed"];

  it.each(valid)("accepts '%s'", (v) => {
    expect(maintenanceStatusEnum.parse(v)).toBe(v);
  });

  it("rejects unknown value", () => {
    expect(() => maintenanceStatusEnum.parse("cancelled")).toThrow();
  });
});

// ── Components ──

describe("createComponentSchema", () => {
  it("accepts minimal valid input (name only)", () => {
    const result = createComponentSchema.parse({ name: "API" });
    expect(result.name).toBe("API");
    expect(result.description).toBe("");
    expect(result.group_name).toBe("");
    expect(result.status).toBe("operational");
  });

  it("accepts full valid input", () => {
    const input = {
      name: "Database",
      description: "Primary PostgreSQL",
      group_name: "Infrastructure",
      status: "degraded" as const,
    };
    expect(createComponentSchema.parse(input)).toMatchObject(input);
  });

  it("rejects empty name", () => {
    expect(() => createComponentSchema.parse({ name: "" })).toThrow();
  });

  it("rejects name exceeding 100 chars", () => {
    expect(() => createComponentSchema.parse({ name: "x".repeat(101) })).toThrow();
  });

  it("accepts name at exactly 100 chars", () => {
    const result = createComponentSchema.parse({ name: "x".repeat(100) });
    expect(result.name).toHaveLength(100);
  });

  it("rejects description exceeding 500 chars", () => {
    expect(() =>
      createComponentSchema.parse({ name: "API", description: "d".repeat(501) })
    ).toThrow();
  });

  it("accepts description at exactly 500 chars", () => {
    const result = createComponentSchema.parse({ name: "API", description: "d".repeat(500) });
    expect(result.description).toHaveLength(500);
  });

  it("rejects group_name exceeding 100 chars", () => {
    expect(() =>
      createComponentSchema.parse({ name: "API", group_name: "g".repeat(101) })
    ).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() =>
      createComponentSchema.parse({ name: "API", status: "broken" })
    ).toThrow();
  });
});

describe("updateComponentSchema", () => {
  it("accepts valid input", () => {
    const result = updateComponentSchema.parse({ name: "API v2" });
    expect(result.name).toBe("API v2");
  });

  it("rejects empty name", () => {
    expect(() => updateComponentSchema.parse({ name: "" })).toThrow();
  });

  it("rejects missing name", () => {
    expect(() => updateComponentSchema.parse({})).toThrow();
  });
});

// ── Incidents ──

describe("createIncidentSchema", () => {
  it("accepts minimal valid input (title only)", () => {
    const result = createIncidentSchema.parse({ title: "Outage" });
    expect(result.title).toBe("Outage");
    expect(result.impact).toBe("minor");
    expect(result.message).toBe("");
    expect(result.component_ids).toEqual([]);
  });

  it("accepts full valid input with UUIDs", () => {
    const input = {
      title: "DB connection failure",
      impact: "critical" as const,
      message: "Investigating root cause",
      component_ids: [
        "123e4567-e89b-12d3-a456-426614174000",
        "987fcdeb-51a2-43d7-b6ef-123456789abc",
      ],
    };
    const result = createIncidentSchema.parse(input);
    expect(result.component_ids).toHaveLength(2);
  });

  it("rejects empty title", () => {
    expect(() => createIncidentSchema.parse({ title: "" })).toThrow();
  });

  it("rejects title exceeding 200 chars", () => {
    expect(() => createIncidentSchema.parse({ title: "t".repeat(201) })).toThrow();
  });

  it("accepts title at exactly 200 chars", () => {
    const result = createIncidentSchema.parse({ title: "t".repeat(200) });
    expect(result.title).toHaveLength(200);
  });

  it("rejects message exceeding 2000 chars", () => {
    expect(() =>
      createIncidentSchema.parse({ title: "Outage", message: "m".repeat(2001) })
    ).toThrow();
  });

  it("rejects invalid UUID in component_ids", () => {
    expect(() =>
      createIncidentSchema.parse({ title: "Outage", component_ids: ["not-a-uuid"] })
    ).toThrow();
  });

  it("rejects malformed UUID (wrong length)", () => {
    expect(() =>
      createIncidentSchema.parse({ title: "Outage", component_ids: ["123e4567-e89b-12d3-a456"] })
    ).toThrow();
  });

  it("accepts empty component_ids array", () => {
    const result = createIncidentSchema.parse({ title: "Outage", component_ids: [] });
    expect(result.component_ids).toEqual([]);
  });
});

describe("addIncidentUpdateSchema", () => {
  it("accepts valid input", () => {
    const result = addIncidentUpdateSchema.parse({
      status: "identified",
      message: "Root cause found",
    });
    expect(result.status).toBe("identified");
    expect(result.message).toBe("Root cause found");
  });

  it("rejects missing status", () => {
    expect(() => addIncidentUpdateSchema.parse({ message: "update" })).toThrow();
  });

  it("rejects missing message", () => {
    expect(() => addIncidentUpdateSchema.parse({ status: "monitoring" })).toThrow();
  });

  it("rejects empty message", () => {
    expect(() =>
      addIncidentUpdateSchema.parse({ status: "monitoring", message: "" })
    ).toThrow();
  });

  it("rejects message exceeding 2000 chars", () => {
    expect(() =>
      addIncidentUpdateSchema.parse({ status: "monitoring", message: "m".repeat(2001) })
    ).toThrow();
  });

  it("accepts message at exactly 2000 chars", () => {
    const result = addIncidentUpdateSchema.parse({
      status: "resolved",
      message: "m".repeat(2000),
    });
    expect(result.message).toHaveLength(2000);
  });

  it("rejects invalid status", () => {
    expect(() =>
      addIncidentUpdateSchema.parse({ status: "fixed", message: "done" })
    ).toThrow();
  });
});

describe("updateIncidentSchema", () => {
  it("accepts valid input", () => {
    const result = updateIncidentSchema.parse({ title: "Updated title", impact: "major" });
    expect(result.title).toBe("Updated title");
    expect(result.impact).toBe("major");
  });

  it("rejects missing title", () => {
    expect(() => updateIncidentSchema.parse({ impact: "minor" })).toThrow();
  });

  it("rejects missing impact", () => {
    expect(() => updateIncidentSchema.parse({ title: "Title" })).toThrow();
  });

  it("rejects empty title", () => {
    expect(() => updateIncidentSchema.parse({ title: "", impact: "minor" })).toThrow();
  });
});

// ── Maintenances ──

describe("createMaintenanceSchema", () => {
  const validMaintenance = {
    title: "DB Migration",
    description: "Upgrading to v15",
    scheduled_start: "2025-01-01T00:00:00Z",
    scheduled_end: "2025-01-01T04:00:00Z",
  };

  it("accepts valid input", () => {
    const result = createMaintenanceSchema.parse(validMaintenance);
    expect(result.title).toBe("DB Migration");
  });

  it("accepts minimal input (no description)", () => {
    const result = createMaintenanceSchema.parse({
      title: "Upgrade",
      scheduled_start: "2025-06-01T00:00:00Z",
      scheduled_end: "2025-06-01T02:00:00Z",
    });
    expect(result.description).toBe("");
  });

  it("rejects end time before start time", () => {
    expect(() =>
      createMaintenanceSchema.parse({
        title: "Upgrade",
        scheduled_start: "2025-01-01T04:00:00Z",
        scheduled_end: "2025-01-01T00:00:00Z",
      })
    ).toThrow();
  });

  it("rejects end time equal to start time", () => {
    expect(() =>
      createMaintenanceSchema.parse({
        title: "Upgrade",
        scheduled_start: "2025-01-01T00:00:00Z",
        scheduled_end: "2025-01-01T00:00:00Z",
      })
    ).toThrow();
  });

  it("rejects empty title", () => {
    expect(() =>
      createMaintenanceSchema.parse({ ...validMaintenance, title: "" })
    ).toThrow();
  });

  it("rejects title exceeding 200 chars", () => {
    expect(() =>
      createMaintenanceSchema.parse({ ...validMaintenance, title: "t".repeat(201) })
    ).toThrow();
  });

  it("rejects description exceeding 2000 chars", () => {
    expect(() =>
      createMaintenanceSchema.parse({ ...validMaintenance, description: "d".repeat(2001) })
    ).toThrow();
  });

  it("rejects empty scheduled_start", () => {
    expect(() =>
      createMaintenanceSchema.parse({ ...validMaintenance, scheduled_start: "" })
    ).toThrow();
  });

  it("rejects empty scheduled_end", () => {
    expect(() =>
      createMaintenanceSchema.parse({ ...validMaintenance, scheduled_end: "" })
    ).toThrow();
  });

  it("rejects missing scheduled_start", () => {
    const { scheduled_start, ...rest } = validMaintenance;
    expect(() => createMaintenanceSchema.parse(rest)).toThrow();
  });
});

describe("updateMaintenanceSchema", () => {
  const validUpdate = {
    title: "DB Migration v2",
    scheduled_start: "2025-02-01T00:00:00Z",
    scheduled_end: "2025-02-01T06:00:00Z",
  };

  it("accepts valid input with default status", () => {
    const result = updateMaintenanceSchema.parse(validUpdate);
    expect(result.status).toBe("scheduled");
  });

  it("accepts explicit status", () => {
    const result = updateMaintenanceSchema.parse({ ...validUpdate, status: "in_progress" });
    expect(result.status).toBe("in_progress");
  });

  it("rejects invalid status", () => {
    expect(() =>
      updateMaintenanceSchema.parse({ ...validUpdate, status: "cancelled" })
    ).toThrow();
  });

  it("rejects end time before start time", () => {
    expect(() =>
      updateMaintenanceSchema.parse({
        ...validUpdate,
        scheduled_start: "2025-02-01T06:00:00Z",
        scheduled_end: "2025-02-01T00:00:00Z",
      })
    ).toThrow();
  });
});

// ── Pages ──

describe("createPageSchema", () => {
  it("accepts minimal valid input (name only)", () => {
    const result = createPageSchema.parse({ name: "Main" });
    expect(result.name).toBe("Main");
    expect(result.slug).toBe("");
    expect(result.description).toBe("");
  });

  it("accepts full valid input", () => {
    const result = createPageSchema.parse({
      name: "Status",
      slug: "status-main",
      description: "Primary status page",
    });
    expect(result.slug).toBe("status-main");
  });

  it("rejects empty name", () => {
    expect(() => createPageSchema.parse({ name: "" })).toThrow();
  });

  it("rejects name exceeding 100 chars", () => {
    expect(() => createPageSchema.parse({ name: "n".repeat(101) })).toThrow();
  });

  it("rejects slug exceeding 100 chars", () => {
    expect(() => createPageSchema.parse({ name: "Page", slug: "s".repeat(101) })).toThrow();
  });

  it("rejects description exceeding 500 chars", () => {
    expect(() =>
      createPageSchema.parse({ name: "Page", description: "d".repeat(501) })
    ).toThrow();
  });
});

describe("updatePageSchema", () => {
  it("accepts valid input", () => {
    const result = updatePageSchema.parse({ name: "Updated Page" });
    expect(result.name).toBe("Updated Page");
  });

  it("rejects empty name", () => {
    expect(() => updatePageSchema.parse({ name: "" })).toThrow();
  });

  it("rejects missing name", () => {
    expect(() => updatePageSchema.parse({})).toThrow();
  });

  it("rejects description exceeding 500 chars", () => {
    expect(() =>
      updatePageSchema.parse({ name: "Page", description: "d".repeat(501) })
    ).toThrow();
  });
});

// ── Auth ──

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.parse({ email: "user@example.com", password: "secret123" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => signInSchema.parse({ email: "notanemail", password: "secret123" })).toThrow();
  });

  it("rejects empty email", () => {
    expect(() => signInSchema.parse({ email: "", password: "secret123" })).toThrow();
  });

  it("rejects password shorter than 6 chars", () => {
    expect(() => signInSchema.parse({ email: "a@b.com", password: "12345" })).toThrow();
  });

  it("accepts password at exactly 6 chars", () => {
    const result = signInSchema.parse({ email: "a@b.com", password: "123456" });
    expect(result.password).toBe("123456");
  });

  it("rejects missing email", () => {
    expect(() => signInSchema.parse({ password: "secret123" })).toThrow();
  });

  it("rejects missing password", () => {
    expect(() => signInSchema.parse({ email: "a@b.com" })).toThrow();
  });
});

describe("signUpSchema", () => {
  it("accepts valid credentials", () => {
    const result = signUpSchema.parse({ email: "new@example.com", password: "newpass1" });
    expect(result.email).toBe("new@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => signUpSchema.parse({ email: "bad", password: "secret123" })).toThrow();
  });

  it("rejects short password", () => {
    expect(() => signUpSchema.parse({ email: "a@b.com", password: "abc" })).toThrow();
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = resetPasswordSchema.parse({ email: "user@example.com" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => resetPasswordSchema.parse({ email: "nope" })).toThrow();
  });

  it("rejects empty email", () => {
    expect(() => resetPasswordSchema.parse({ email: "" })).toThrow();
  });

  it("rejects missing email", () => {
    expect(() => resetPasswordSchema.parse({})).toThrow();
  });
});

// ── Subscribers ──

describe("subscribeSchema", () => {
  it("accepts valid email", () => {
    const result = subscribeSchema.parse({ email: "sub@example.com" });
    expect(result.email).toBe("sub@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => subscribeSchema.parse({ email: "not-email" })).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => subscribeSchema.parse({ email: "" })).toThrow();
  });
});

// ── Helpers ──

describe("formDataToObject", () => {
  it("converts single-value fields", () => {
    const fd = new FormData();
    fd.append("name", "Test");
    fd.append("value", "123");
    const obj = formDataToObject(fd);
    expect(obj).toEqual({ name: "Test", value: "123" });
  });

  it("converts multi-value fields to arrays", () => {
    const fd = new FormData();
    fd.append("tags", "a");
    fd.append("tags", "b");
    fd.append("tags", "c");
    const obj = formDataToObject(fd);
    expect(obj.tags).toEqual(["a", "b", "c"]);
  });

  it("handles empty FormData", () => {
    const fd = new FormData();
    const obj = formDataToObject(fd);
    expect(obj).toEqual({});
  });

  it("handles mixed single and multi-value fields", () => {
    const fd = new FormData();
    fd.append("name", "Test");
    fd.append("ids", "1");
    fd.append("ids", "2");
    const obj = formDataToObject(fd);
    expect(obj.name).toBe("Test");
    expect(obj.ids).toEqual(["1", "2"]);
  });
});

describe("parseFormData", () => {
  it("returns success for valid data", () => {
    const fd = new FormData();
    fd.append("email", "test@example.com");
    const result = parseFormData(subscribeSchema, fd);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("returns failure for invalid data", () => {
    const fd = new FormData();
    fd.append("email", "bad");
    const result = parseFormData(subscribeSchema, fd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("returns failure with error message for missing required field", () => {
    const fd = new FormData();
    const result = parseFormData(signInSchema, fd);
    expect(result.success).toBe(false);
  });
});
