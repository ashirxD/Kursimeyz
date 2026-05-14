import { useMemo } from 'react';

interface Customer {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  image?: string;
  createdAt: string;
  role: string;
}

interface CustomersTableProps {
  customers: Customer[];
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const getColorForUser = (name: string) => {
  const colors = ['#7ab89a', '#d4824a', '#9a7ab8', '#4a7c4a', '#b87a7a', '#7ab8d4'];
  const index = name?.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function CustomersTable({ customers }: CustomersTableProps) {
  const customerCount = useMemo(() => customers.length, [customers]);

  return (
    <div className="bg-white rounded-5xl shadow-soft overflow-hidden border border-white/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-forest-moss/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Customer</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Email</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Phone</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Joined</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-moss/5">
            {customers.map((customer) => (
              <tr key={customer._id} className="group hover:bg-oatmeal/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full border-2 border-white flex items-center justify-center font-black text-white text-[10px] shadow-sm"
                      style={{ backgroundColor: getColorForUser(customer.username || customer.email) }}
                    >
                      {getInitials(customer.username || customer.email)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-forest-moss/80 leading-none">
                        {customer.username || 'No name'}
                      </p>
                      <p className="text-[10px] font-bold text-forest-moss-light/50 mt-1 uppercase tracking-tighter">
                        ID #{customer._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-black text-forest-moss/80">{customer.email}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-black text-forest-moss/80">{customer.phone || '-'}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-black text-forest-moss/80">{formatDate(customer.createdAt)}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-moss/10 text-forest-moss text-[10px] font-black uppercase tracking-[0.2em]">
                    {customer.role}
                  </span>
                </td>
              </tr>
            ))}
            {customerCount === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-sm font-black text-forest-moss/50">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
