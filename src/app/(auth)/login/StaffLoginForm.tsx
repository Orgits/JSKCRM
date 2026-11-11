"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, IdCard, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { staffLoginSchema, type StaffLoginValues } from "@/lib/validation/auth";

export function StaffLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffLoginValues>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { staffId: "", password: "", remember: false },
  });

  async function onSubmit() {
    // Mock: no auth API yet — any valid input moves on to OTP verification.
    await new Promise((r) => setTimeout(r, 500));
    router.push("/login/verify-otp");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <TextField
        label="Staff ID"
        required
        autoComplete="username"
        placeholder="e.g. JSK-S-014"
        leadingIcon={<IdCard {...iconProps} />}
        error={errors.staffId?.message}
        {...register("staffId")}
      />
      <TextField
        label="Password"
        required
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Enter your password"
        leadingIcon={<LockKeyhole {...iconProps} />}
        trailingIcon={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="flex rounded text-text-muted outline-none hover:text-text-secondary focus-visible:text-brand-600"
          >
            {showPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
          </button>
        }
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox label="Keep me signed in on this device" {...register("remember")} />
      </div>

      <Button
        type="submit"
        fullWidth
        loading={isSubmitting}
        trailingIcon={<ArrowRight {...iconProps} />}
      >
        Sign in
      </Button>

      <p className="text-center text-[13px] leading-[18px] text-text-secondary">
        Forgot your password? Ask your branch administrator to reset it.
      </p>
    </form>
  );
}
