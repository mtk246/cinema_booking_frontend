const maxTextTruncateLength = 10;

// constants for Table pagination
const paginationSize = 4;
const pageStartIndex = 0;
const firstPageText = 'First';
const prePageText = 'Back';
const nextPageText = 'Next';
const lastPageText = 'Last';
const nextPageTitle = 'First page';
const prePageTitle = 'Pre page';
const firstPageTitle = 'Next page';
const lastPageTitle = 'Last page';
const showTotal = true;
const disablePageTitle = true;
const sizePerPageListObj_1 = {
    text: '5',
    value: 5,
};
const sizePerPageListObj_2 = {
    text: '10',
    value: 10,
};
const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total ms-2">
        Showing { from } to { to } of { size } Results
    </span>
);
// constants for Table pagination End

const featurePageSize = 5;

// Modal Title

const modalTitle = {
    create: 'Create',
    edit: 'Edit',
    confirm: 'Confirm',
    cancel: 'Cancel',
}

// Modal Title End

export {
    maxTextTruncateLength,
    paginationSize,
    pageStartIndex,
    firstPageText,
    prePageText,
    nextPageText,
    lastPageText,
    nextPageTitle,
    prePageTitle,
    firstPageTitle,
    lastPageTitle,
    showTotal,
    disablePageTitle,
    sizePerPageListObj_1,
    sizePerPageListObj_2,
    customTotal,
    modalTitle,
    featurePageSize,
};