'use client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/lib/db/schema/customer';
import { CustomerStatus, Pagination, Sorting, SortOrder } from '@/types';

// Importing necessary components and types from Tanstack
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

// Importing necessary components from Shadcn
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Custom type for TableMeta
interface MyTableMeta {
    changeStatus: (id: string, status: CustomerStatus) => void;
    toast: (options: { title: string; description?: string }) => void;
}

// Extend the TableMeta with custom type
declare module '@tanstack/react-table' {
    interface TableMeta<TData> extends MyTableMeta {}
}

// Interface for DataTableProps
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    changeStatus: (id: string, status: CustomerStatus) => void;
    totalPageCount: number | undefined;
    pagination: Pagination;
    setPagination: (pagination: Pagination) => void;
    sorting: Sorting<Customer>;
    onSortingChange: (sortBy: keyof Customer, sortOrder: SortOrder) => void;
}

// DataTable component
export function DataTable<TData, TValue>({
    columns,
    data,
    changeStatus,
    totalPageCount,
    pagination,
    setPagination,
    sorting,
    onSortingChange,
}: DataTableProps<TData, TValue>) {
    const { toast } = useToast();

    // Create the table
    const table = useReactTable({
        data,
        columns,
        meta: {
            changeStatus,
            toast,
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: (updatedSorting) => {
            if (Array.isArray(updatedSorting) && updatedSorting.length > 0) {
                const { id, desc } = updatedSorting[0];
                onSortingChange(
                    id as keyof Customer,
                    desc ? SortOrder.Descending : SortOrder.Ascending
                );
            }
        },
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting: [
                {
                    id: sorting.sortBy,
                    desc: sorting.sortOrder === SortOrder.Descending,
                },
            ],
            pagination: {
                pageIndex: pagination.pageNumber,
                pageSize: pagination.pageSize,
            },
        },
        manualPagination: true,
        pageCount:
            totalPageCount !== undefined ? totalPageCount + 1 : undefined,
    });

    return (
        <div>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className:
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                    onClick:
                                                        header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[
                                                    header.column.getIsSorted() as string
                                                ] ?? null}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPagination({
                            ...pagination,
                            pageNumber: pagination.pageNumber - 1,
                        })
                    }
                    disabled={pagination.pageNumber === 0}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPagination({
                            ...pagination,
                            pageNumber: pagination.pageNumber + 1,
                        })
                    }
                    disabled={
                        totalPageCount === undefined ||
                        pagination.pageNumber >= totalPageCount
                    }
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
