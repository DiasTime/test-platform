"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    email: "admin@test.com",
    iin: "000000000000",
    firstName: "Admin",
    lastName: "User",
    secret: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/create-first-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": formData.secret,
        },
        body: JSON.stringify({
          email: formData.email,
          iin: formData.iin,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await res.json();
      setResult({
        success: data.success,
        message: data.success ? data.message : data.error,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Ошибка соединения: " + String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Создание первого админа</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="secret"
            type="password"
            label="Секретный ключ (ADMIN_SETUP_SECRET)"
            value={formData.secret}
            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
            required
          />

          <Input
            id="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            id="iin"
            type="text"
            label="ИИН"
            maxLength={12}
            value={formData.iin}
            onChange={(e) => setFormData({ ...formData, iin: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              label="Имя"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              id="lastName"
              label="Фамилия"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg ${
                result.success
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {result.message}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Создать админа
          </Button>
        </form>
      </Card>
    </div>
  );
}
