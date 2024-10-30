import { StreetAddress } from "@/types";
import React from "react";

type Props = {
	address?: StreetAddress;
};

export default function AddressDetails(props: Props) {
	return (
		<div>
			<p className="text-sm">{props.address?.line1}</p>
			<p className="text-sm">{props.address?.line2}</p>
		</div>
	);
}
