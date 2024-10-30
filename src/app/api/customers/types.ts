// Workaround for enum not being exported from the route file
// To rename an enum we need to redeclare to a const
// Next.js errors if we export constants from a route file except for the predefined ones
export enum CustomersSearchParams {
    Line1 = 'address.line1',
    Line2 = 'address.line2',
    Status = 'status',
    PageSize = 'pageSize',
    PageNumber = 'pageNumber',
    SortBy = 'sortBy',
    SortOrder = 'sortOrder',
    FilterKey = 'filterKey',
    FilterValue = 'filterValue',
}
