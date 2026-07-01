"use client";

import { useEffect, useState } from "react";
import { Boxes, CopyPlus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import type { CalculatorBuildPayload } from "./calculator-build-payload";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  deleteCalculatorAccountBuild,
  listCalculatorAccountBuilds,
  saveCalculatorAccountBuild,
  updateCalculatorAccountBuild,
  type CalculatorAccountBuild,
} from "./calculator-build-api";

type CalculatorBuildsModalProps = {
  copy: CalculatorDictionary;
  currentBuild: CalculatorBuildPayload;
  onClose: () => void;
  onLoadBuild: (build: CalculatorBuildPayload) => void;
  onMarkAsSaved: () => void;
  onRenameBuild: (name: string) => void;
};

export function CalculatorBuildsModal({
  copy,
  currentBuild,
  onClose,
  onLoadBuild,
  onMarkAsSaved,
  onRenameBuild,
}: CalculatorBuildsModalProps) {
  const t = copy.builds;
  const [builds, setBuilds] = useState<CalculatorAccountBuild[]>([]);
  const [message, setMessage] = useState("");
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "saving" | "deleting" | "unauthenticated" | "error"
  >("loading");
  const selectedBuild = selectedBuildId
    ? builds.find((build) => build.id === selectedBuildId)
    : null;
  const isBusy = status === "saving" || status === "deleting";

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
            ? t.unauthenticatedMessage
            : "",
        );
      })
      .catch(() => {
        if (!isCurrent) return;

        setStatus("error");
        setMessage(t.loadError);
      });

    return () => {
      isCurrent = false;
    };
  }, [t.loadError, t.unauthenticatedMessage]);

  async function handleCreate() {
    setStatus("saving");
    setMessage("");

    try {
      const savedBuild = await saveCalculatorAccountBuild(currentBuild);

      setBuilds((currentBuilds) => [
        savedBuild,
        ...currentBuilds.filter((build) => build.id !== savedBuild.id),
      ]);
      setSelectedBuildId(savedBuild.id);
      setStatus("idle");
      setMessage(t.savedMessage);
      onMarkAsSaved();
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || t.saveError);
    }
  }

  async function handleUpdate() {
    if (!selectedBuildId) {
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      const updatedBuild = await updateCalculatorAccountBuild(
        selectedBuildId,
        currentBuild,
      );

      setBuilds((currentBuilds) =>
        currentBuilds.map((build) =>
          build.id === updatedBuild.id ? updatedBuild : build,
        ),
      );
      setStatus("idle");
      setMessage(t.updatedMessage);
      onMarkAsSaved();
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || t.updateError);
    }
  }

  async function handleDelete(buildId: string) {
    setStatus("deleting");

    try {
      await deleteCalculatorAccountBuild(buildId);
      setBuilds((currentBuilds) =>
        currentBuilds.filter((build) => build.id !== buildId),
      );
      if (selectedBuildId === buildId) {
        setSelectedBuildId(null);
      }
      setStatus("idle");
      setMessage(t.deletedMessage);
    } catch {
      setStatus("error");
      setMessage(t.deleteError);
    }
  }

  async function handleDuplicate(build: CalculatorAccountBuild) {
    setStatus("saving");
    setMessage("");

    try {
      const payload = cloneBuildPayload(build.payload);
      payload.name = `${build.name} ${t.duplicateSuffix}`;
      const savedBuild = await saveCalculatorAccountBuild(payload);

      setBuilds((currentBuilds) => [
        savedBuild,
        ...currentBuilds.filter(
          (currentBuild) => currentBuild.id !== savedBuild.id,
        ),
      ]);
      setSelectedBuildId(savedBuild.id);
      setStatus("idle");
      setMessage(t.duplicatedMessage);
      onMarkAsSaved();
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || t.duplicateError);
    }
  }

  return (
    <Modal
      ariaLabel={t.aria}
      className="calculator-builds-modal"
      closeLabel={t.closeAction}
      icon={<Boxes size={17} />}
      title={t.title}
      meta={t.meta}
      onClose={onClose}
    >
        <div className="calculator-build-save-row">
          <Field label={t.nameLabel}>
            <Input
              maxLength={80}
              value={currentBuild.name}
              onChange={(event) => onRenameBuild(event.target.value)}
            />
          </Field>
          <Button
            icon={<Save size={16} />}
            type="button"
            disabled={!selectedBuildId || isBusy}
            onClick={handleUpdate}
          >
            {t.updateAction}
          </Button>
          <Button
            icon={<CopyPlus size={16} />}
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={handleCreate}
          >
            {t.saveAsAction}
          </Button>
        </div>

        {selectedBuild ? (
          <p className="calculator-build-selected">
            {t.selectedPrefix} <strong>{selectedBuild.name}</strong>
          </p>
        ) : null}

        <div className="calculator-build-list" aria-live="polite">
          {status === "loading" ? (
            <p>{t.loading}</p>
          ) : builds.length > 0 ? (
            builds.map((build) => (
              <article
                className="calculator-build-row"
                data-selected={build.id === selectedBuildId}
                key={build.id}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuildId(build.id);
                    onLoadBuild(build.payload);
                  }}
                >
                  <strong>{build.name}</strong>
                  <span>
                    {build.classId.replace(/_/g, " ")} /{" "}
                    {formatBuildDate(build.updatedAt)}
                  </span>
                </button>
                <IconButton
                  label={`${t.duplicateAction} ${build.name}`}
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDuplicate(build)}
                >
                  <CopyPlus size={16} />
                </IconButton>
                <IconButton
                  label={`${t.deleteAction} ${build.name}`}
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDelete(build.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </article>
            ))
          ) : (
            <p>{t.empty}</p>
          )}
        </div>

        {message ? <p className="calculator-build-message">{message}</p> : null}
    </Modal>
  );
}

function formatBuildDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function cloneBuildPayload(payload: CalculatorBuildPayload): CalculatorBuildPayload {
  return JSON.parse(JSON.stringify(payload)) as CalculatorBuildPayload;
}
