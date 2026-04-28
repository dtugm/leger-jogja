"use client";

import { CirclePlus } from "lucide-react";

import Button from "@/components/button";
import { useApiHandler } from "@/hooks/use-api-handler";
import { useAuth } from "@/hooks/use-auth";
import { useMenu } from "@/hooks/use-menu";
import { ApiDeleteData, ApiGetData, ApiPostData } from "@/services/api";
import { useAppStore } from "@/store/app-store";
import { withApiHandler } from "@/utils/with-api-handler";




export default function DemoSkeletonPage() {
  // 1. API Wrapper Hook (untuk dalam React component)
  const { execute: executeApi, isLoading } = useApiHandler();

  // 2. Auth Service (via Hook)
  const { isAuthenticated, setToken, removeToken } = useAuth();

  // 3. Menu Service (via Hook)
  const { menu, setMenu, clearMenu } = useMenu();

  // 4. Global Store (Zustand)
  const { sidebarOpen, toggleSidebar } = useAppStore();

  // --- HANDLER FUNCTIONS ---

  // A. Contoh GET Data menggunakan Custom Hook wrapper
  const handleGetData = async () => {
    await executeApi({
      request: () => ApiGetData("https://jsonplaceholder.typicode.com/posts/1"),
      successMessage: "Data berhasil diambil!",
      errorMessage: "Gagal mengambil data",
    });
  };

  // B. Contoh POST Data menggunakan Custom Hook wrapper
  const handlePostData = async () => {
    await executeApi({
      request: () => ApiPostData("https://jsonplaceholder.typicode.com/posts", {
        title: "Test",
        body: "Test Content",
        userId: 1,
      }),
      successMessage: "Berhasil membuat data baru!",
    });
  };

  // C. Contoh DELETE Data menggunakan Standalone wrapper (withApiHandler)
  // Bisa digunakan bahkan di luar react component / redux thunk / server action params handling
  const handleDeleteData = async () => {
    try {
      await withApiHandler({
        // Karena endpoint aslinya tidak valid (karena backend asli blm diset, request ke localhost:8000 default),
        // ini akan trigger error toast yang mendemokan interceptor error.
        request: () => ApiDeleteData("/users/1"),
        successMessage: "Data user berhasil dihapus!",
        errorMessage: "Gagal menghapus user, periksa koneksi atau endpoint.",
      });
    } catch (e) {
      console.error("Delete failed caught in UI", e);
    }
  };

  // D. Auth Token Manipulation
  const handleLoginFake = async () => {
    await setToken("fake-jwt-token-ey12345");
  };

  // E. Menu Role Manipulation
  const handleSetAdminMenu = () => {
    setMenu({
      role: "admin",
      menus: [
        { id: "1", label: "Dashboard", path: "/dashboard" },
        { id: "2", label: "Users Mgt", path: "/users" }
      ]
    });
  };

  return (
    <div className="overflow-y-auto h-screen">
      <div className="p-8 max-w-4xl mx-auto space-y-8 bg-white/50 dark:bg-black/20 rounded-xl m-8 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skeleton Implementation Demo</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Halaman ini mendemonstrasikan implementasi services, helper API, toast, dan status store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

          SECTION 1: API & TOAST
          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold">1. API Helper & Toast</h2>
            <p className="text-sm text-gray-500">Mencoba request HTTP menggunakan Axios/Fetch wrapper yang men-trigger custom toast otomatis.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGetData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                Test ApiGetData (Success Mock)
              </button>
              <button
                onClick={handlePostData}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50"
              >
                Test ApiPostData (Success Mock)
              </button>
              <button
                onClick={handleDeleteData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Test ApiDeleteData (Error Mock)
              </button>
            </div>
          </div>
          {/* SECTION 2: GLOBAL STATE (ZUSTAND) */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold">2. Global Store (Zustand)</h2>
            <p className="text-sm text-gray-500">State management yang persisten antar halaman.</p>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span>Sidebar Status: <strong className={sidebarOpen ? "text-green-500" : "text-red-500"}>{sidebarOpen ? "OPEN" : "CLOSED"}</strong></span>
              <button
                onClick={toggleSidebar}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors"
              >
                Toggle
              </button>
            </div>
          </div>

          {/* SECTION 3: AUTH TOKEN SERVICE */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold">3. Auth Token (Encrypted)</h2>
            <p className="text-sm text-gray-500">Token dienkripsi AES-GCM sebelum disimpan ke localStorage.</p>

            <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-md break-all">
              <strong>Current status:</strong> {isAuthenticated ? (
                <span className="text-green-500">Authenticated (Token Decrypted)</span>
              ) : "Not Authenticated"}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLoginFake}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
              >
                Login (Set Token)
              </button>
              <button
                onClick={removeToken}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Logout (Remove)
              </button>
            </div>
          </div>

          {/* SECTION 4: MENU SERVICE */}
          <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold">4. Menu Service (Role-based)</h2>
            <p className="text-sm text-gray-500">Menu dinamis disave ke localStorage berdasarkan role.</p>

            <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              {menu ? (
                <div>
                  <strong>Role:</strong> {menu.role}
                  <ul className="list-disc ml-5 mt-2">
                    {menu.menus.map(m => (
                      <li key={m.id}>{m.label} ({m.path})</li>
                    ))}
                  </ul>
                </div>
              ) : "Belum ada menu (kosong)"}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSetAdminMenu}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
              >
                Set Menu
              </button>
              <button
                onClick={clearMenu}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* SECTION 5: BUTTON COMPONENT */}
          <div className="col-span-2 space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold">5. Button Component</h2>

            {/* Primary */}
            <div className="space-y-2">
              <h3>Primary</h3>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="primary" size="sm" text="Button" />
                <Button variant="primary" size="md" text="Button" />
                <Button variant="primary" size="lg" text="Button" />
                <Button variant="primary" size="sm" text="Button" disabled />
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="primary" size="sm" text="Button" iconLeft={<CirclePlus size={16} />} />
                <Button variant="primary" size="md" text="Button" iconLeft={<CirclePlus size={16} />} />
                <Button variant="primary" size="lg" text="Button" iconLeft={<CirclePlus size={16} />} />
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="primary" size="sm" text="Button" iconRight={<CirclePlus size={16} />} />
                <Button variant="primary" size="md" text="Button" iconRight={<CirclePlus size={16} />} />
                <Button variant="primary" size="lg" text="Button" iconRight={<CirclePlus size={16} />} />
              </div>
            </div>

            {/* Secondary */}
            <div className="space-y-2">
              <h3>Secondary</h3>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="secondary" size="sm" text="Button" />
                <Button variant="secondary" size="md" text="Button" />
                <Button variant="secondary" size="lg" text="Button" />
                <Button variant="secondary" size="sm" text="Button" disabled />
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="secondary" size="sm" text="Button" iconLeft={<CirclePlus size={16} />} />
                <Button variant="secondary" size="md" text="Button" iconLeft={<CirclePlus size={16} />} />
                <Button variant="secondary" size="lg" text="Button" iconLeft={<CirclePlus size={16} />} />
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="secondary" size="sm" text="Button" iconRight={<CirclePlus size={16} />} />
                <Button variant="secondary" size="md" text="Button" iconRight={<CirclePlus size={16} />} />
                <Button variant="secondary" size="lg" text="Button" iconRight={<CirclePlus size={16} />} />
              </div>
            </div>

            {/* Tertiary */}
            <div className="space-y-2">
              <h3>Tertiary</h3>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="tertiary" size="sm" text="Button" />
                <Button variant="tertiary" size="md" text="Button" />
                <Button variant="tertiary" size="lg" text="Button" />
                <Button variant="tertiary" size="sm" text="Button" disabled />
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="tertiary" size="sm" text="Button" iconLeft={<CirclePlus size={16} />} />
                <Button variant="tertiary" size="md" text="Button" iconLeft={<CirclePlus size={16} />} />
                <Button variant="tertiary" size="lg" text="Button" iconLeft={<CirclePlus size={16} />} />
              </div>
              <div className="flex flex-wrap gap-3 items-start">
                <Button variant="tertiary" size="sm" text="Button" iconRight={<CirclePlus size={16} />} />
                <Button variant="tertiary" size="md" text="Button" iconRight={<CirclePlus size={16} />} />
                <Button variant="tertiary" size="lg" text="Button" iconRight={<CirclePlus size={16} />} />
              </div>
            </div>

          </div> */

        </div>
      </div>
    </div>
  );
}
