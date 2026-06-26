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
import { UserPlus, Plus, Loader2, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AddConversation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'private' | 'group'>('private');
  
  // Private chat state
  const [number, setNumber] = useState("");
  
  // Group chat state
  const [groupName, setGroupName] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [addedNumbers, setAddedNumbers] = useState<string[]>([]);

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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    if (addedNumbers.length === 0) {
      setStatus('error');
      setMessage("Please add at least one member.");
      return;
    }
    setStatus('loading');
    setMessage("");

    try {
      const currentUserId = await fetch('/api/current-user-id');
      const currentUserIdData = await currentUserId.text();

      const response = await fetch(`/api/add-group-conversation/${currentUserIdData}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim(),
          numbers: addedNumbers,
        }),
      });
      const data = await response.json();

      if (data.status === 200) {
        setStatus('success');
        setMessage("Group chat created successfully!");
        queryClient.invalidateQueries({ queryKey: ['currentUserConversations'] });
        setTimeout(() => {
          setOpen(false);
          setGroupName("");
          setAddedNumbers([]);
          setMemberNumber("");
          setStatus('idle');
          setMessage("");
        }, 1200);
      } else {
        setStatus('error');
        setMessage(data.message || "Failed to create group");
      }
    } catch {
      setStatus('error');
      setMessage("An error occurred while creating group.");
    }
  };

  const addMemberToList = () => {
    const num = memberNumber.trim();
    if (!num) return;
    if (addedNumbers.includes(num)) {
      setMemberNumber("");
      return;
    }
    setAddedNumbers((prev) => [...prev, num]);
    setMemberNumber("");
  };

  const removeMemberFromList = (num: string) => {
    setAddedNumbers((prev) => prev.filter((n) => n !== num));
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setNumber("");
      setGroupName("");
      setAddedNumbers([]);
      setMemberNumber("");
      setStatus('idle');
      setMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-500/25 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          New Chat / Group
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[440px] rounded-2xl border-gray-200 shadow-2xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-white text-lg font-bold">
              <Plus className="h-5 w-5" />
              New Conversation
            </DialogTitle>
            <DialogDescription className="text-indigo-100 mt-1 text-xs">
              Start a new 1-to-1 private chat or create a multi-member group conversation.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => { setActiveTab('private'); setStatus('idle'); setMessage(""); }}
            className={cn(
              "flex-1 py-3 text-center text-sm font-bold transition-all border-b-2",
              activeTab === 'private'
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            <span className="flex items-center justify-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Private Chat
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('group'); setStatus('idle'); setMessage(""); }}
            className={cn(
              "flex-1 py-3 text-center text-sm font-bold transition-all border-b-2",
              activeTab === 'group'
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4" /> New Group
            </span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {activeTab === 'private' ? (
            /* Private Chat Panel */
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("chat.phoneNumber")}</label>
              <Input
                type="text"
                placeholder={t("chat.phonePlaceholder")}
                value={number}
                onChange={(e) => { setNumber(e.target.value); setStatus('idle'); setMessage(""); }}
                className="h-11 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 text-gray-900 placeholder:text-gray-400"
                dir="ltr"
              />
            </div>
          ) : (
            /* Group Panel */
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Group Name</label>
                <Input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => { setGroupName(e.target.value); setStatus('idle'); setMessage(""); }}
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Member (Phone Number)</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. 112"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    className="h-11 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400 text-gray-900 flex-1"
                    dir="ltr"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMemberToList();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addMemberToList}
                    className="h-11 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-xl px-4 font-bold flex items-center justify-center"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {addedNumbers.length > 0 && (
                <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50 max-h-36 overflow-y-auto">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Group Members ({addedNumbers.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {addedNumbers.map((num) => (
                      <span key={num} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                        {num}
                        <button
                          type="button"
                          onClick={() => removeMemberFromList(num)}
                          className="text-gray-400 hover:text-red-500 font-bold focus:outline-none transition-colors text-sm leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">{message}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2.5 p-3 bg-red-50 rounded-xl border border-red-100 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{message}</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 gap-2 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl h-10 px-5 border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            {t("common.cancel")}
          </Button>

          {activeTab === 'private' ? (
            <Button
              size="sm"
              onClick={handleAddConversation}
              disabled={status === 'loading' || status === 'success' || !number.trim()}
              className="rounded-xl h-10 px-5 bg-indigo-500 hover:bg-indigo-600 text-white border-0 transition-all duration-200 disabled:opacity-50 font-bold"
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
          ) : (
            <Button
              size="sm"
              onClick={handleCreateGroup}
              disabled={status === 'loading' || status === 'success' || !groupName.trim() || addedNumbers.length === 0}
              className="rounded-xl h-10 px-5 bg-indigo-500 hover:bg-indigo-600 text-white border-0 transition-all duration-200 disabled:opacity-50 font-bold"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                  Creating…
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 me-2" />
                  Create Group
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}