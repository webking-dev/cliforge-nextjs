"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { Phone, PhoneCall, Mail, Copy, Send } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    // DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// import { ToastAction } from "@/components/ui/toast"

import { CustomerStatus, CustomerStatusDisplay, EmailList, PhoneList, StreetAddress } from '@/types';
import { Customer } from "@/lib/db/schema/customer"
import { StarFilled, StarEmpty } from "./icons/stars"

// Define the columns for the CRM table
export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "name", // Customer name is accessed by the accessorKey "name"
        header: "Home Owner", // Header text displayed for the "name" column
        // Cell renderer needs to be defined if the data is not already in a tabular format
    },
    {
        accessorKey: "address", // Accessor key for the address column
        header: "Address", // Header text displayed for the "address" column
        // Define the cell renderer for the address column
        cell: ({ row }) => {
            // Access the address data from the row
            const address: StreetAddress = row.getValue("address");
            
            return (
                // Display the address data in a structured format
                <div>
                    <div>{address.line1}</div>
                    <div className="text-xs text-gray-500">
                        {address.line2}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "saleScore",
        header: "Compatibility",
    },
    {
        accessorKey: "savingsRating",
        header: "Estimated Savings",
    
        cell: ({row}) => {
            // Access the savings rating from the row
            const stars: number = row.getValue("savingsRating");
            
            return (
                // Display the savings rating formatted as 0-5 stars
                <div className="flex">
                    {[...Array(5)].map((_, i) =>
                        i < stars ? (
                            <StarFilled key={i} />
                        ) : (
                            <StarEmpty key={i} />
                        )
                    )}
                </div>
            )
        }
    },
    
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row, table }) => {
            // Access the customer data from the row
            const customer = row.original;
            
            // Access the status from the row
            const status: CustomerStatus = row.getValue("status");

            // Access the change status function from the table options
            const changeStatus = table.options.meta?.changeStatus;
            
            // Access the toast function from the table options
            const toast = table.options.meta?.toast;

            return (
                <Select
                    defaultValue={
                        CustomerStatus.NewLead
                    }
                    value={status}
                    // Change the status of the customer when the status is changed from the select menu
                    onValueChange={(newStatus) => {
                        // call the changeStatus function with the customer id and the new status
                        changeStatus?.(customer.id, newStatus as CustomerStatus)
                        // Display a toast message to the user
                        toast?.({
                            title: `Status changed to ${newStatus}`,
                            description: `The status for ${customer.name} has been updated.`,
                        });
                    }}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(
                            CustomerStatus
                        ).map((val) => (
                            <SelectItem
                                key={val}
                                value={val}
                            >
                                {
                                    CustomerStatusDisplay[
                                        val
                                    ]
                                }
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        }
    },
    {
        id: "action", // Action column used to display the action buttons, does not have a header
        cell: ({ row, table }) => {
            const customer = row.original
            const primaryEmail = row.original.primaryEmail
            const primaryPhone = row.original.primaryPhone
            const phones: PhoneList = row.original.phones
            const emails: EmailList = row.original.emails
            const toast = table.options.meta?.toast
            return (
                <div className="flex justify-center gap-2">
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                            <Phone />
                        </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            {phones.map((p, i) => (
                                <DropdownMenuItem key={i} className="flex gap-4 justify-between"
                                >
                                    <span className="">{p.phone}</span>
                                    <div className="flex gap-2 justify-end items-end">
                                    <Button size='sm'
                                        onClick={() => {
                                            navigator.clipboard.writeText(p.phone)
                                            toast?.({
                                                title: `Phone Number Copied!`,
                                                description: `The phone number has been successfully copied to your clipboard.`,
                                            });
                                        }}>
                                        <Copy className="w-[16px]"/>
                                    </Button>
                                    <Button  size='sm'
                                        onClick={() => {
                                            window.location.href = `tel:${customer.primaryPhone}`
                                            toast?.({
                                                title: `Calling Phone Number...`,
                                                description: `The phone number has been successfully copied to your clipboard.`,
                                            });
                                        }}>
                                        <PhoneCall className="w-[16px]"/>
                                    </Button>
                                    </div>
                                    
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                            <Mail />
                        </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent>
                            {emails.map((p, i) => (
                                <DropdownMenuItem key={i} className="flex gap-4 justify-between"
                                >
                                    <span className="">{p.email}</span>
                                    <div className="flex gap-2 justify-end items-end">
                                    <Button size='sm'
                                        onClick={() => {
                                            navigator.clipboard.writeText(p.email)
                                            toast?.({
                                                title: `Email Copied!`,
                                                description: `The email address has been successfully copied to your clipboard.`,
                                            });
                                        }}>
                                        <Copy className="w-[16px]"/>
                                    </Button>
                                    <Button  size='sm'
                                        onClick={() => {
                                            window.location.href = `mailto:${customer.primaryEmail}`
                                            toast?.({
                                                title: `Composing Email...`,
                                                description: `Sending an email to the selected customer.`,
                                            });
                                        }}>
                                        <Send className="w-[16px]"/>
                                    </Button>
                                    </div>
                                    
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    } 
    
]