"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServicesApi, updateServiceApi } from "@/lib/clinic/api/services";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Check, X } from "lucide-react";
import type { Service } from "@/lib/types";

function EditableCell({
  value,
  onSave,
  prefix = "",
}: {
  value: number;
  onSave: (v: number) => void;
  prefix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value.toString());

  if (!editing) {
    return (
      <div className="flex items-center gap-1 group">
        <span>
          {prefix}
          {value}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={val}
        onChange={e => setVal(e.target.value)}
        className="h-6 w-20 text-xs p-1"
        autoFocus
      />
      <button
        onClick={() => {
          onSave(Number(val));
          setEditing(false);
        }}
      >
        <Check className="h-3.5 w-3.5 text-success" />
      </button>
      <button
        onClick={() => {
          setVal(value.toString());
          setEditing(false);
        }}
      >
        <X className="h-3.5 w-3.5 text-destructive" />
      </button>
    </div>
  );
}

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: getServicesApi,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Service> }) =>
      updateServiceApi(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });
      const prev = queryClient.getQueryData<Service[]>(["services"]);
      queryClient.setQueryData<Service[]>(
        ["services"],
        old => old?.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(["services"], ctx?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Services</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Hover over price or duration to edit inline
        </p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Service
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Price (₹)
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Duration
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map(svc => (
                <tr key={svc.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium">{svc.name}</td>
                  <td className="px-4 py-2.5">
                    <EditableCell
                      value={svc.price}
                      prefix="₹"
                      onSave={price =>
                        updateMutation.mutate({ id: svc.id, updates: { price } })
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <EditableCell
                        value={svc.duration_minutes}
                        onSave={duration_minutes =>
                          updateMutation.mutate({ id: svc.id, updates: { duration_minutes } })
                        }
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {svc.is_multi_session ? (
                      <Badge className="text-xs bg-warning-subtle text-warning border border-warning/20">
                        {svc.session_count} sessions
                      </Badge>
                    ) : (
                      <Badge variant="muted" className="text-xs">
                        Single visit
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
