"use client";

import { useState } from "react";
import { Boxes, CopyPlus, Save, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["calculator-builds"],
    queryFn: async () => {
      const result = await listCalculatorAccountBuilds();
      if (result.status === "unauthenticated") {
        throw new CalculatorBuildsUnauthenticatedError();
      }
      return result.builds;
    },
    retry: false,
  });

  const builds = data ?? [];
  const selectedBuild = selectedBuildId
    ? builds.find((build) => build.id === selectedBuildId)
    : null;

  const createMutation = useMutation({
    mutationFn: (payload: CalculatorBuildPayload) => saveCalculatorAccountBuild(payload),
    onSuccess: (savedBuild) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(["calculator-builds"], (old) => {
        return old ? [savedBuild, ...old] : [savedBuild];
      });
      setSelectedBuildId(savedBuild.id);
      setMessage(t.savedMessage);
      onMarkAsSaved();
    },
    onError: (err: Error) => setMessage(err.message || t.saveError),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CalculatorBuildPayload }) => 
      updateCalculatorAccountBuild(id, payload),
    onSuccess: (updatedBuild) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(["calculator-builds"], (old) => {
        return old ? old.map((b) => b.id === updatedBuild.id ? updatedBuild : b) : [updatedBuild];
      });
      setMessage(t.updatedMessage);
      onMarkAsSaved();
    },
    onError: (err: Error) => setMessage(err.message || t.updateError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCalculatorAccountBuild(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(["calculator-builds"], (old) => {
        return old ? old.filter((b) => b.id !== deletedId) : [];
      });
      if (selectedBuildId === deletedId) {
        setSelectedBuildId(null);
      }
      setMessage(t.deletedMessage);
    },
    onError: () => setMessage(t.deleteError),
  });

  const duplicateMutation = useMutation({
    mutationFn: (build: CalculatorAccountBuild) => {
      const payload = cloneBuildPayload(build.payload);
      payload.name = `${build.name} ${t.duplicateSuffix}`;
      return saveCalculatorAccountBuild(payload);
    },
    onSuccess: (savedBuild) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(["calculator-builds"], (old) => {
        return old ? [savedBuild, ...old] : [savedBuild];
      });
      setSelectedBuildId(savedBuild.id);
      setMessage(t.duplicatedMessage);
      onMarkAsSaved();
    },
    onError: (err: Error) => setMessage(err.message || t.duplicateError),
  });

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending;

  // Process status message from fetch query
  let statusMessage = message;
  if (error) {
    statusMessage = error instanceof CalculatorBuildsUnauthenticatedError ? t.unauthenticatedMessage : t.loadError;
  }

  function handleCreate() {
    setMessage("");
    createMutation.mutate(currentBuild);
  }

  function handleUpdate() {
    if (!selectedBuildId) return;
    setMessage("");
    updateMutation.mutate({ id: selectedBuildId, payload: currentBuild });
  }

  function handleDelete(buildId: string) {
    setMessage("");
    deleteMutation.mutate(buildId);
  }

  function handleDuplicate(build: CalculatorAccountBuild) {
    setMessage("");
    duplicateMutation.mutate(build);
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
          {isLoading ? (
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

        {statusMessage ? <p className="calculator-build-message">{statusMessage}</p> : null}
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

class CalculatorBuildsUnauthenticatedError extends Error {
  constructor() {
    super("Unauthenticated");
  }
}
