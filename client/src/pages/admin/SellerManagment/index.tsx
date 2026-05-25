import Header from "@/pages/admin/layout/Header";

export default function SellerManagementPage() {
  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-1 items-center justify-center px-4 md:px-2">
        <p className="text-2xl md:text-3xl font-black text-forest-moss/40 tracking-tight">
          Coming Soon
        </p>
      </div>
    </div>
  );
}
