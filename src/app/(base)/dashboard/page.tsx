'use client';

import useAppStateStore from '@/lib/stores/appStateStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    ArrowRight,
    Award,
    BadgeDollarSign,
    CalendarCheck,
    CirclePause,
    CircleSlash,
    Egg,
    Ellipsis,
    FileSignature,
    MailCheck,
    MailOpen,
    MailWarning,
    MessageCircleWarning,
    Microscope,
    Plus,
    RefreshCcw,
    Send,
    ShieldCheck,
    ShieldX,
    Sprout,
    X,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { getCustomersCount } from '@/lib/internal-apis/client';
import { CustomerStatus, CustomerStatusDisplay } from '@/types';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const statusIcons = {
    [CustomerStatus.NewLead]: Egg,
    [CustomerStatus.QualifiedLead]: ShieldCheck,
    [CustomerStatus.DisqualifiedLead]: ShieldX,
    [CustomerStatus.Nurture]: Sprout,
    [CustomerStatus.Open]: MailOpen,
    [CustomerStatus.ProposalSent]: MailCheck,
    [CustomerStatus.Negotiation]: MessageCircleWarning,
    [CustomerStatus.ContractSent]: Send,
    [CustomerStatus.ContractSigned]: FileSignature,
    [CustomerStatus.ClosedWon]: Award,
    [CustomerStatus.ClosedLost]: CircleSlash,
    [CustomerStatus.OnHold]: CirclePause,
    [CustomerStatus.Renewal]: RefreshCcw,
    [CustomerStatus.UpsellCrossSellOpportunity]: BadgeDollarSign,
    [CustomerStatus.Pending]: Ellipsis,
    [CustomerStatus.FollowUp]: MailWarning,
    [CustomerStatus.Research]: Microscope,
    [CustomerStatus.MeetingScheduled]: CalendarCheck,
};

const STORAGE_KEY = 'dashboardStatuses';

export default function Dashboard() {
    const { data: session } = useSession();
    const [statuses, setStatuses] = useState<CustomerStatus[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | null>(
        null
    );
    const setHeaderExpanded = useAppStateStore(
        (state) => state.setHeaderExpanded
    );
    setHeaderExpanded(false);

    const {
        data: allCustomerCount,
        isFetching: allCustomerCountIsFetching,
        refetch: refetchAllCustomerCount,
    } = useQuery({
        queryKey: ['get-customers-count', 'all'],
        queryFn: getCustomersCount(),
    });

    const statusQueries = useQueries({
        queries: statuses.map((status) => ({
            queryKey: ['get-customers-count', status],
            queryFn: getCustomersCount({ key: 'status', value: status }),
        })),
    });

    const anyStatusIsFetching =
        statusQueries.some((query) => query.isFetching) ||
        allCustomerCountIsFetching;

    const refetchAll = () => {
        refetchAllCustomerCount();
        statusQueries.forEach((query) => query.refetch());
    };

    const totalCustomers = allCustomerCount?.totalCount || 0;

    useEffect(() => {
        const defaultStatuses = [
            CustomerStatus.NewLead,
            CustomerStatus.QualifiedLead,
            CustomerStatus.FollowUp,
            CustomerStatus.MeetingScheduled,
        ];

        const savedStatuses = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '[]'
        );

        if (savedStatuses.length == 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStatuses));
        }

        setStatuses(
            savedStatuses.length == 0 ? defaultStatuses : savedStatuses
        );
    }, []);

    // add a lead status card to the dashboard
    const addStatusCard = () => {
        if (selectedStatus && !statuses.includes(selectedStatus)) {
            const newStatuses = [...statuses, selectedStatus];
            setStatuses(newStatuses);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
            setSelectedStatus(null);
        }
    };

    // remove a lead status card from the dashboard
    const removeStatusCard = (statusToRemove: CustomerStatus) => {
        const newStatuses = statuses.filter(
            (status) => status !== statusToRemove
        );
        setStatuses(newStatuses);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
    };

    const SkeletonCard = () => (
        <div className="w-full max-w-[350px] aspect-square">
            <Card className="flex flex-col justify-between h-full w-full p-4">
                <div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-12 w-24 mt-4" />
                </div>
                <Skeleton className="h-4 w-3/4" />
            </Card>
        </div>
    );

    return (
        <section className="flex min-h-screen pt-28 px-7 bg-slate-100">
            {/* Main Content */}
            <div className="flex flex-col w-full gap-10">
                <div>
                    <h1 className="text-4xl font-bold">
                        Hello{session?.user?.name && ', ' + session.user.name}
                    </h1>
                    <h1 className="text-3xl text-primary">
                        Today is looking good!
                    </h1>
                </div>
                {!anyStatusIsFetching && (
                    <div className="w-min">
                        <Link href="/crm" className="block h-full w-full">
                            <Button
                                className="flex flex-col justify-between h-full w-full 
                                hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-primary/10 bg-primary/5 gap-4 border-2 border-primary/10 hover:border-primary/20"
                                variant="ghost"
                            >
                                <div>
                                    <h1 className="font-medium text-4xl sm:text-5xl lg:text-6xl">
                                        {totalCustomers}
                                    </h1>
                                    <p className="text-gray-500 font-bold">
                                        Leads
                                    </p>
                                </div>
                                <div className="flex items-center justify-end w-full gap-4">
                                    <p className="text-primary font-bold">
                                        View All
                                    </p>
                                    <ArrowRight className="h-6 w-6 text-primary" />
                                </div>
                            </Button>
                        </Link>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {anyStatusIsFetching
                        ? // Show skeleton cards while loading
                          statuses.map((_, index) => (
                              <SkeletonCard key={index} />
                          ))
                        : statuses.map((status) => {
                              const StatusIcon = statusIcons[status] || Plus;
                              const statusCount =
                                  statusQueries.find(
                                      (q) => q.data?.filter?.value === status
                                  )?.data?.totalCount || 0;
                              return (
                                  <div
                                      key={status}
                                      className="relative w-full max-w-[350px] aspect-square group"
                                  >
                                      <Card
                                          className="flex flex-col justify-between h-full w-full 
                                    hover:shadow-lg transform transition-all duration-300 hover:scale-105 border-2 border-primary/10 hover:border-primary/20"
                                      >
                                          <div>
                                              <StatusIcon className="m-4" />
                                              <h1 className="font-medium text-4xl sm:text-5xl lg:text-6xl ml-4">
                                                  {statusCount}
                                              </h1>
                                          </div>
                                          <p className="m-4 text-gray-500">
                                              {CustomerStatusDisplay[status]}
                                          </p>
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              className="absolute flex justify-center items-center top-1 right-1 opacity-0 
                                        group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                                              onClick={() =>
                                                  removeStatusCard(status)
                                              }
                                          >
                                              <X className="h-4 w-4" />
                                              <span className="sr-only">
                                                  Remove card
                                              </span>
                                          </Button>
                                      </Card>
                                  </div>
                              );
                          })}
                    {anyStatusIsFetching &&
                        // Show skeleton cards while loading
                        statuses.map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                </div>
            </div>

            {/* Sidebar Buttons */}
            <div className="flex flex-col items-right gap-5">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex rounded-full h-[60px] gap-3"
                        >
                            Add Status to Dashboard <Plus />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                    Select Status
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Choose a status to add a new lead card.
                                </p>
                            </div>
                            <Select
                                onValueChange={(value) =>
                                    setSelectedStatus(value as CustomerStatus)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(CustomerStatus)
                                        .filter(
                                            (status) =>
                                                !statuses.includes(status)
                                        )
                                        .map((status) => (
                                            <SelectItem
                                                key={status}
                                                value={status}
                                            >
                                                {CustomerStatusDisplay[status]}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={addStatusCard}
                                disabled={!selectedStatus}
                            >
                                Add Status Card
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </section>
    );
}
