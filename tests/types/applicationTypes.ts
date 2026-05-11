type Tab =
	| 'Dashboard'
	| 'Admin'
	| 'PIM'
	| 'Leave'
	| 'Time'
	| 'Recruitment'
	| 'My Info'
	| 'Performance'
	| 'Directory'
	| 'Maintenance'
	| 'Claim'
	| 'Buzz';

type TabHeading =
	| 'Dashboard'
	| '/ User Management'
	| 'PIM'
	| 'Leave'
	| '/ Timesheets'
	| 'Recruitment'
	| '/ Manage Reviews'
	| 'Directory'
	| '/ Purge Records'
	| 'Claim'
	| 'Buzz';

type button = 'Save' | 'Cancel' | 'Add' | 'Delete' | 'Confirm' | 'Search';

export { Tab, TabHeading, button };
