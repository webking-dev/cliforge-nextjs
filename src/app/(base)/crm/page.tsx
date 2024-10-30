'use client';

import { PostCustomersRequestSchema } from '@/app/api/customers/[id]/route';

import { Customer } from '@/lib/db/schema/customer';
import { getCustomers, updateCustomer } from '@/lib/internal-apis/client';
import useAppStateStore from '@/lib/stores/appStateStore';
import { CustomerStatus, Pagination, Sorting, SortOrder } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Manrope } from 'next/font/google';
import { useState } from 'react';
import { columns } from '../../../components/crm/columns';
import { DataTable } from '../../../components/crm/data-table';

const fontManrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export default function Crm() {
    const setHeaderExpanded = useAppStateStore(
        (state) => state.setHeaderExpanded
    );
    setHeaderExpanded(false);

    const [sorting, setSorting] = useState<Sorting<Customer>>({
        sortBy: 'createdAt',
        sortOrder: SortOrder.Descending,
    });

    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        pageSize: 10,
    });

    const {
        data: customersResponse,
        isFetching: customersIsFetching,
        refetch: refetchCustomers,
    } = useQuery({
        queryKey: [
            'get-customers',
            pagination.pageNumber,
            pagination.pageSize,
            sorting.sortBy,
            sorting.sortOrder,
        ],
        queryFn: getCustomers(pagination, sorting),
    });

    // Update customer mutation, updates customer in database and re-fetches customers
    const updateCustomerMutation = useMutation({
        mutationFn: ({
            customerId,
            updatedCustomer,
        }: {
            customerId: Customer['id'];
            updatedCustomer: PostCustomersRequestSchema;
        }) => updateCustomer(customerId, updatedCustomer)(),
        onSuccess: async () => await refetchCustomers(),
    });

    // Change customer lead status
    const changeStatus = (
        customerId: Customer['id'],
        newStatus: CustomerStatus
    ) => {
        updateCustomerMutation.mutate({
            customerId,
            updatedCustomer: {
                status: newStatus,
            },
        });
    };

    const data = customersResponse?.data || [];
    const pageNumber = customersResponse?.metadata.pagination.pageNumber;
    const totalCount = customersResponse?.metadata.totalCount || 0;

    const handleSorting = (sortBy: keyof Customer, sortOrder: SortOrder) => {
        setSorting({ sortBy, sortOrder });
    };

    return (
        <section className="w-full min-h-screen bg-slate-100 pt-20">
            <h1
                className={`${fontManrope.variable} font-bold text-[32px] mt-6 mx-6`}
            >
                Customer Relationship Management
            </h1>

            <div className="py-10 mx-6">
                <DataTable
                    columns={columns}
                    data={data}
                    changeStatus={changeStatus}
                    totalPageCount={pageNumber}
                    pagination={pagination}
                    setPagination={setPagination}
                    sorting={sorting}
                    onSortingChange={handleSorting}
                />
            </div>
        </section>
    );
}
