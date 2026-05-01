"use client";

import type { CSSProperties } from "react";
import type { FormQuestion, RepairabilityAnswers, SelectOption } from "../types";

interface StepRendererProps {
  questions: FormQuestion[];
  answers: RepairabilityAnswers;
  objectTypeOptions: SelectOption[];
  mainSymptomOptions: SelectOption[];
  requiredFields?: string[];
  fieldErrors?: Record<string, string>;
  onChange: (id: string, value: unknown) => void;
}

function renderSelectOptions(question: FormQuestion, objectTypeOptions: SelectOption[], mainSymptomOptions: SelectOption[]) {
  if (question.id === "objectType") return objectTypeOptions;
  if (question.id === "mainSymptom") return mainSymptomOptions;
  return question.options ?? [];
}

function isVisible(question: FormQuestion, answers: RepairabilityAnswers): boolean {
  if (!question.visibleWhen || question.visibleWhen.length === 0) return true;

  return question.visibleWhen.every((condition) => {
    const current = answers[condition.field];
    if (condition.equals !== undefined) {
      return Array.isArray(current) ? current.includes(condition.equals) : current === condition.equals;
    }
    if (condition.notEquals !== undefined) {
      return Array.isArray(current) ? !current.includes(condition.notEquals) : current !== condition.notEquals;
    }
    if (condition.in) {
      return Array.isArray(current)
        ? current.some((entry) => condition.in?.includes(entry))
        : condition.in.includes(current as string | number | boolean);
    }
    return true;
  });
}

export function StepRenderer({
  questions,
  answers,
  objectTypeOptions,
  mainSymptomOptions,
  requiredFields = [],
  fieldErrors = {},
  onChange,
}: StepRendererProps) {
  const cardStyle: CSSProperties = {
    display: "grid",
    gap: 12,
    padding: 22,
    borderRadius: 22,
    border: "1px solid rgba(72, 86, 150, 0.12)",
    background: "#ffffff",
    boxShadow: "0 14px 28px rgba(31, 36, 56, 0.06)",
  };

  const titleStyle: CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: "#485696",
    lineHeight: 1.25,
    letterSpacing: -0.2,
  };

  const hintStyle: CSSProperties = {
    marginTop: -2,
    fontSize: 13.5,
    color: "#5e647d",
    lineHeight: 1.4,
  };

  const fieldInputStyle: CSSProperties = {
    width: "100%",
    border: "1px solid rgba(72, 86, 150, 0.14)",
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 15,
    lineHeight: 1.4,
    color: "#1f2438",
    background: "#fbfaf7",
    outline: "none",
  };

  const requiredLabelStyle: CSSProperties = {
    color: "#b91c1c",
    fontWeight: 700,
    marginLeft: 6,
  };

  function renderFieldLabel(question: FormQuestion) {
    const isRequired = requiredFields.includes(question.id);
    return (
      <span style={titleStyle}>
        {question.label}
        {isRequired && <span style={requiredLabelStyle}>*</span>}
      </span>
    );
  }

  const optionButtonStyle = (selected: boolean): CSSProperties => ({
    border: selected ? "1px solid #485696" : "1px solid rgba(72, 86, 150, 0.14)",
    background: selected ? "linear-gradient(180deg, rgba(249, 199, 132, 0.32) 0%, #fffaf0 100%)" : "#ffffff",
    color: selected ? "#485696" : "#374151",
    borderRadius: 14,
    padding: "12px 13px",
    textAlign: "left",
    fontSize: 14,
    lineHeight: 1.4,
    cursor: "pointer",
    transition: "all 160ms ease",
    fontWeight: selected ? 600 : 500,
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {questions.filter((question) => isVisible(question, answers)).map((question) => {
        const options = renderSelectOptions(question, objectTypeOptions, mainSymptomOptions);
        const value = answers[question.id];
        const fieldError = fieldErrors[question.id];

        if (question.type === "text" || question.type === "email" || question.type === "number" || question.type === "textarea") {
          return (
            <label key={question.id} style={cardStyle} id={`field-${question.id}`}>
              {renderFieldLabel(question)}
              {question.helpText && <small style={hintStyle}>{question.helpText}</small>}
              {question.type === "textarea" ? (
                <textarea
                  rows={4}
                  style={{ ...fieldInputStyle, resize: "vertical" }}
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) => onChange(question.id, event.target.value)}
                />
              ) : (
                <input
                  type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
                  style={fieldInputStyle}
                  value={typeof value === "string" || typeof value === "number" ? value : ""}
                  onChange={(event) =>
                    onChange(
                      question.id,
                      question.type === "number"
                        ? event.target.value === ""
                          ? undefined
                          : Number(event.target.value)
                        : event.target.value,
                    )
                  }
                />
              )}
              {fieldError && <small style={{ color: "#b91c1c", fontSize: 13 }}>{fieldError}</small>}
            </label>
          );
        }

        if (question.type === "single_select") {
          return (
            <div key={question.id} style={cardStyle} id={`field-${question.id}`}>
              {renderFieldLabel(question)}
              {question.helpText && <small style={hintStyle}>{question.helpText}</small>}
              <div style={{ display: "grid", gap: 9, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                {options.map((option) => {
                  const selected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      style={optionButtonStyle(selected)}
                      onClick={() => onChange(question.id, option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {fieldError && <small style={{ color: "#b91c1c", fontSize: 13 }}>{fieldError}</small>}
            </div>
          );
        }

        if (question.type === "multi_select") {
          const currentValues = Array.isArray(value) ? (value as string[]) : [];
          return (
            <fieldset key={question.id} style={{ ...cardStyle, margin: 0 }} id={`field-${question.id}`}>
              <legend style={{ ...titleStyle, padding: "0 4px" }}>
                {question.label}
                {requiredFields.includes(question.id) && <span style={requiredLabelStyle}>*</span>}
              </legend>
              {question.helpText && <small style={hintStyle}>{question.helpText}</small>}
              <div style={{ display: "grid", gap: 9, marginTop: 8, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                {options.map((option) => (
                  <label
                    key={option.value}
                    style={{
                      ...optionButtonStyle(currentValues.includes(option.value)),
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={currentValues.includes(option.value)}
                      onChange={(event) => {
                        let nextValues = event.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((entry) => entry !== option.value);
                        if (option.value === "aucun" && event.target.checked) {
                          nextValues = ["aucun"];
                        } else if (event.target.checked) {
                          nextValues = nextValues.filter((entry) => entry !== "aucun");
                        }
                        onChange(question.id, nextValues);
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {fieldError && <small style={{ color: "#b91c1c", fontSize: 13 }}>{fieldError}</small>}
            </fieldset>
          );
        }

        if (question.type === "boolean") {
          return (
            <div key={question.id} style={cardStyle} id={`field-${question.id}`}>
              {renderFieldLabel(question)}
              {question.helpText && <small style={hintStyle}>{question.helpText}</small>}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  border: "1px solid rgba(72, 86, 150, 0.14)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={value === true}
                  onChange={(event) => onChange(question.id, event.target.checked)}
                />
                <span style={{ color: "#374151", lineHeight: 1.5 }}>J'ai lu et j'accepte.</span>
              </label>
              {fieldError && <small style={{ color: "#b91c1c", fontSize: 13 }}>{fieldError}</small>}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
