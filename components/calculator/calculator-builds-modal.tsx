"use client";

import { useEffect, useState } from "react";
import { Boxes, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { PanelHeader } from "@/components/ui/panel-header";
import type { CalculatorBuildPayload } from "./calculator-build-payload";
import {
  deleteCalculatorAccountBuild,
  listCalculatorAccountBuilds,
  saveCalculatorAccountBuild,
  type CalculatorAccountBuild,
} from "./calculator-build-api";

type CalculatorBuildsModalProps = {
  currentBuild: CalculatorBuildPayload;
  onClose: () => void;
  onLoadBuild: (build: CalculatorBuildPayload) => void;
  onRenameBuild: (name: string) => void;
};

export function CalculatorBuildsModal({
  currentBuild,
  onClose,
  onLoadBuild,
  onRenameBuild,
}: CalculatorBuildsModalProps) {
  const [builds, setBuilds] = useState<CalculatorAccountBuild[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "saving" | "unauthenticated" | "error"
  >("loading");

  useEffect(() => {
    let isCurrent = true;

    listCalculatorAccountBuilds()
      .then((result) => {
        if (!isCurrent) return;

        setBuilds(result.builds);
        setStatus(
          result.status === "unauthenticated" ? "unauthenticated" : "idle",
        );
        setMessage(
          result.status === "unauthenticated"
            ? "Entre na conta para salvar builds no servidor. O save local continua ativo."
            : "",
        );
      })
      .catch(() => {
        if (!isCurrent) return;

        setStatus("error");
        setMessage("Nao foi possivel carregar builds da conta.");
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleSave() {
    setStatus("saving");
    setMessage("");

    try {
      const savedBuild = await saveCalculatorAccountBuild(currentBuild);

      setBuilds((currentBuilds) => [
        savedBuild,
        ...currentBuilds.filter((build) => build.id !== savedBuild.id),
      ]);
      setStatus("idle");
      setMessage("Build salva na conta.");
    } catch {
      setStatus("error");
      setMessage("Nao foi possivel salvar. Verifique se voce esta logado.");
    }
  }

  async function handleDelete(buildId: string) {
    try {
      await deleteCalculatorAccountBuild(buildId);
      setBuilds((currentBuilds) =>
        currentBuilds.filter((build) => build.id !== buildId),
      );
      setMessage("Build removida.");
    } catch {
      setStatus("error");
      setMessage("Nao foi possivel remover a build.");
    }
  }

  return (
    <div className="calc-modal-backdrop" role="presentation">
      <section
        aria-modal="true"
        className="calc-modal calculator-builds-modal"
        role="dialog"
        aria-label="Builds da calculadora"
      >
        <PanelHeader icon={<Boxes size={17} />} title="Builds" meta="Conta" />
        <IconButton
          className="calc-modal-close"
          label="Fechar"
          type="button"
          onClick={onClose}
        >
          <X size={17} />
        </IconButton>

        <div className="calculator-build-save-row">
          <Field label="Nome da build">
            <Input
              maxLength={80}
              value={currentBuild.name}
              onChange={(event) => onRenameBuild(event.target.value)}
            />
          </Field>
          <Button
            icon={<Save size={16} />}
            type="button"
            disabled={status === "saving"}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </div>

        <div className="calculator-build-list" aria-live="polite">
          {status === "loading" ? (
            <p>Carregando builds...</p>
          ) : builds.length > 0 ? (
            builds.map((build) => (
              <article className="calculator-build-row" key={build.id}>
                <button
                  type="button"
                  onClick={() => {
                    onLoadBuild(build.payload);
                    onClose();
                  }}
                >
                  <strong>{build.name}</strong>
                  <span>{build.classId.replace(/_/g, " ")}</span>
                </button>
                <IconButton
                  label={`Remover ${build.name}`}
                  type="button"
                  onClick={() => handleDelete(build.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </article>
            ))
          ) : (
            <p>Nenhuma build salva na conta ainda.</p>
          )}
        </div>

        {message ? <p className="calculator-build-message">{message}</p> : null}
      </section>
    </div>
  );
}
