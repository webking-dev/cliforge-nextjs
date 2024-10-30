import { AddressResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from './ui/separator';

type Props = {
    data?: AddressResponse;
    requestData: () => void;
};

export default function ResidentInsightsTable(props: Props) {
    if (!props.data) {
        return (
            <Button
                variant="outline"
                className="w-full"
                onClick={props.requestData}
            >
                Load Resident Information
            </Button>
        );
    }

    console.debug('get Resident Insights Data', props.data);
    // if (props.data.isError) return <p>No Resident/Owner Insights Available</p>;

    return (
        <div>
            <h1 className="font-bold text-center text-lg py-2">
                Resident/Owner Insight
            </h1>
            <div className="space-y-8">
                {props.data.isError ? (
                    <p className="text-sm px-4">
                        No Resident/Owner Insights Available
                    </p>
                ) : null}
                {props.data?.persons?.map((person, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 border-2 rounded-xl px-4 py-4"
                    >
                        <h1 className="text-base">
                            <span className="text-sm font-semibold uppercase">
                                Name:
                            </span>{' '}
                            {person.name.firstName} {person.name.middleName}{' '}
                            {person.name.lastName}
                        </h1>
                        <h1 className="text-base">
                            <span className="text-sm font-semibold uppercase">
                                Age:
                            </span>{' '}
                            {person.age}
                        </h1>
                        <h1 className="text-base">
                            <span className="text-sm font-semibold uppercase">
                                Emails:
                            </span>{' '}
                            {person.emails.map((e) => e.email).join(', ')}
                        </h1>
                        <div className="flex flex-col flex-wrap gap-2">
                            {person.emails.map((e, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl bg-slate-100 px-4 py-2"
                                >
                                    <h1 className="text-sm">{e.email}</h1>
                                    <h1 className="text-xs">
                                        <span className="text-xs uppercase">
                                            Validated:
                                        </span>{' '}
                                        {e.isValidated ? 'Yes' : 'No'}
                                    </h1>
                                    <h1 className="text-xs">
                                        <span className="text-xs uppercase">
                                            Business Email:
                                        </span>{' '}
                                        {e.isBusiness ? 'Yes' : 'No'}
                                    </h1>
                                </div>
                            ))}
                        </div>
                        <h1 className="text-base">
                            <span className="text-sm font-semibold uppercase">
                                Phones:
                            </span>
                        </h1>
                        <div className="flex flex-row flex-wrap gap-2">
                            {person.phones.map((p, i) => (
                                <div
                                    key={i}
                                    className={`rounded-xl bg-slate-100 px-4 py-2 ${
                                        i === 0 && 'bg-blue-200'
                                    }`}
                                >
                                    <h1 className="text-sm">{p.number}</h1>
                                    <h1 className="text-xs">{p.type}</h1>
                                    <h1 className="text-xs">{p.isConnected}</h1>
                                    <h1 className="text-xs">
                                        {p.firstReportedDate} -{' '}
                                        {p.lastReportedDate}
                                    </h1>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-md font-bold uppercase">
                                Reported Addresses
                            </h1>
                            {person.addresses.map((address, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-1 pb-4 border-b-2 border-b-slate-200"
                                >
                                    <h1 className="text-md">
                                        {address.houseNumber}, {address.street},{' '}
                                        {address.unit}
                                    </h1>
                                    <h1 className="text-md">
                                        {address.city}, {address.state}{' '}
                                        {address.zip}
                                    </h1>
                                    <h1 className="text-md">
                                        <span className="text-sm font-semibold uppercase">
                                            Reported Dates:
                                        </span>{' '}
                                        {address.firstReportedDate} -{' '}
                                        {address.lastReportedDate}
                                    </h1>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
