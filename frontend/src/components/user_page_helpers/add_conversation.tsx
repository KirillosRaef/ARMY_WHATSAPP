import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AddConversation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState("");

  const handleAddConversation = async () => {
    if (!number.trim()) return;
    setStatus('loading');
    setMessage("");

    try {
      const currentUserId = await fetch('/api/current-user-id');
      const currentUserIdData = await currentUserId.text();

      const response = await fetch(`/api/add-conversation-by-number/${currentUserIdData}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: number.trim() }),
      });
      const data = await response.json();

      if (data.status === 200) {
        setStatus('success');
        setMessage(t('chat.conversationCreated'));
        queryClient.invalidateQueries({ queryKey: ['currentUserConversations'] });
        setTimeout(() => {
          setOpen(false);
          setNumber("");
          setStatus('idle');
          setMessage("");
        }, 1200);
      } else {
        setStatus('error');
        setMessage(data.message || t('chat.addError'));
      }
    } catch {
      setStatus('error');
      setMessage(t('chat.addError'));
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setNumber("");
      setStatus('idle');
      setMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-500/25 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          {t("chat.newConversation")}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] rounded-2xl border-gray-200 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-white text-lg">
              <UserPlus className="h-5 w-5" />
              {t("chat.newConversation")}
            </DialogTitle>
            <DialogDescription className="text-indigo-100 mt-1.5 text-sm">
              {t("chat.addDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("chat.phoneNumber")}</label>
            <Input
              type="text"
              placeholder={t("chat.phonePlaceholder")}
              value={number}
              onChange={(e) => { setNumber(e.target.value); setStatus('idle'); setMessage(""); }}
              className="h-11 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 text-gray-900 placeholder:text-gray-400"
              dir="ltr"
            />
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleAddConversation}
            disabled={status === 'loading' || status === 'success' || !number.trim()}
            className="rounded-xl h-10 px-5 bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 border-0 transition-all duration-200 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin me-2" />
                {t("chat.adding")}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 me-2" />
                {t("chat.add")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}