"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { User } from "@/types";
import { updateUserProfileApi } from "@/lib/api-client";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated: (updatedUser: User) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [noTelepon, setNoTelepon] = useState(user.no_telepon || user.phone || "");
  const [previewPhoto, setPreviewPhoto] = useState<string>(
    user.avatar_url || user.foto_profil || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever modal opens or user prop changes
  React.useEffect(() => {
    if (isOpen) {
      setName(user.name || "");
      setNoTelepon(user.no_telepon || user.phone || "");
      setPreviewPhoto(user.avatar_url || user.foto_profil || "");
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File harus berupa gambar (JPG, PNG, atau WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress photo via HTML5 Canvas (max 600px dimension)
        const canvas = document.createElement("canvas");
        const maxDimension = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.88);
          setPreviewPhoto(compressedBase64);
          setErrorMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await updateUserProfileApi({
        userId: user.id,
        name: name.trim(),
        noTelepon: noTelepon.trim() || undefined,
        fotoProfil: previewPhoto || undefined,
      });

      setSuccessMessage("Profil berhasil disimpan!");
      onProfileUpdated(updated);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background */}
        <div className="relative h-20 bg-gradient-to-r from-[#0EB29A] via-[#2E6E65] to-[#2B3752] p-4 flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold tracking-wide uppercase">
            <UserIcon className="h-4 w-4 text-emerald-300" />
            <span>Edit Profil Akun</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-0 -mt-10">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt={name || "Foto Profil"}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl bg-slate-100"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#0EB29A] to-[#2E6E65] text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-xl">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "PS"}
                </div>
              )}

              {/* Upload Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0EB29A] hover:bg-[#0da08b] text-white shadow-md border-2 border-white transition-transform active:scale-90 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-bold text-[#0EB29A] hover:underline cursor-pointer"
            >
              Ubah Foto Profil
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Nama */}
            <div>
              <label className="block text-[11px] font-bold text-[#2B3752] uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama Lengkap Anda"
                  className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-medium text-[#2B3752] focus:outline-none focus:ring-2 focus:ring-[#0EB29A] focus:border-transparent transition-all"
                />
                <UserIcon className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* No Telepon / WhatsApp */}
            <div>
              <label className="block text-[11px] font-bold text-[#2B3752] uppercase tracking-wider mb-1">
                Nomor WhatsApp / Telepon
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-xs font-medium text-[#2B3752] focus:outline-none focus:ring-2 focus:ring-[#0EB29A] focus:border-transparent transition-all"
                />
                <Phone className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-[11px] font-bold text-[#2B3752] uppercase tracking-wider mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Role & Verification Badge */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Peran Akun:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#0EB29A]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Mitra Pengepul Resmi
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2B3752] text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0EB29A] hover:bg-[#0da08b] text-white text-xs font-bold shadow-md shadow-[#0EB29A]/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Profil</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
