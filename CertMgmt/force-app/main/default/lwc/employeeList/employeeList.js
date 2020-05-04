import { LightningElement, track, wire } from 'lwc';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Employee__c.Id';
import EMPID_FIELD from '@salesforce/schema/Employee__c.Name';
import EMPNAME_FIELD from '@salesforce/schema/Employee__c.Emp_Name__c';
//import EXPERIENCE_FIELD from '@salesforce/schema/Employee__c.Experience_Comments__c';
import EMAIL_FIELD from '@salesforce/schema/Employee__c.Email__c';
import EXPERIENCE_FIELD from '@salesforce/schema/Employee__c.Experience__c';
import ECOMMENTS_FIELD from '@salesforce/schema/Employee__c.Comments__c';
import PRIMARY_FIELD from '@salesforce/schema/Employee__c.Primary_Skill__c';
import SECONDARY_FIELD from '@salesforce/schema/Employee__c.Secondary_Skill__c';
import EMPLOYEE_OBJECT from  '@salesforce/schema/Employee__c';
import deleteEmployeeList from'@salesforce/apex/EmployeeController.deleteEmployeeList';



const COLS = [
    { label: 'ID', fieldName:'Name'},
    { label: 'Name', fieldName:'Emp_Name__c', editable:true},
    //{ label: 'Exprience Comments', fieldName:'Experience_Comments__c', editable:true},
    { label:'Email', fieldName:'Email__c', type:'email', editable:true},
    { label:'Experience', fieldName:'Experience__c', type:'number', editable:true},
    { label:'Comments', fieldName:'Comments__c', editable:true},
    { label: 'Primary Skill', fieldName:'Primary_Skill__c', editable:true, type:'picklist',typeAttributes: {
        placeholder: 'Choose Primary Skill', options: [
            { label: 'App Development', value: 'App Development' },
            { label: 'Big Data', value: 'Big Data' },
            { label: 'Business intelligence/analytics', value: 'Business intelligence/analytics' },
        ] // list of all picklist options
        , value: { fieldName: 'Primary_Skill__c' } // default value for picklist
        , context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
    } },
    { label: 'Secondary Skill', fieldName:'Secondary_Skill__c', type:'picklist', editable:true}
];

export default class EmployeeList extends LightningElement {
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track bShowModal = false;
    @track recordsCount = 0;
    @track buttonLabel = 'Delete';
    @track isTrue = false;

    selectedRecords = [];
    refreshTable;


    @wire(getEmployeeList)
    employee;
    
    openModal(){
        this.bShowModal = true;
    }

    closeModal(){
        this.bShowModal = false;
    }

    employeeObject = EMPLOYEE_OBJECT;
    myFields = [EMPNAME_FIELD, EMAIL_FIELD, EXPERIENCE_FIELD, ECOMMENTS_FIELD, PRIMARY_FIELD, SECONDARY_FIELD];

    handleEmployeeCreated(){
        this.bShowModal = false;
    }

    getSelectedRecords(event) {
        const selectedRows = event.detail.selectedRows;
        this.recordsCount = event.detail.selectedRows.length;
        let empIds = new Set();

        for(let i =0;i<selectedRows.length;i++){
            empIds.add(selectedRows[i].Id);
        }
        this.selectedRecords = Array.from(empIds);
    }

    deleteEmployees(){
        if(this.selectedRecords) {
            this.buttonLabel = 'Processing...';
            this.isTrue = true;
            this.deleteEmps();
        }
    }

    deleteEmps(){
        deleteEmployeeList({lstEmpIds : this.selectedRecords})
        .then(result => {
            this.buttonLabel = 'Delete';
            this.isTrue = false;
            this.dispatchEvent(
                new ShowToastEvent({
                title:'Successfully deleted!',
                message: this.recordsCount + ' Employees are deleted.',
                variant: 'success'
            }),
        );
        this.template.querySelector('lightning-datatable').selectedRows = [];
        this.recordsCount = 0;
        return refreshApex(this.refreshTable);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while getting Employees', 
                    message: error.message, 
                    variant: 'error'
                }),
            );
        });
    }
    handleSave(event) {
        console.log(this.employee);
        console.log("hendel save called");
        const fields = {};
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[EMPID_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[EMPNAME_FIELD.fieldApiName] = event.detail.draftValues[0].Emp_Name__c;
        //fields[EXPERIENCE_FIELD.fieldApiName] = event.detail.draftValues[0].Experience_Comments__c;
        fields[EMAIL_FIELD.fieldApiName] = event.detail.draftValues[0].Email__c;
        fields[EXPERIENCE_FIELD.fieldApiName] = event.detail.draftValues[0].Experience__c;
        fields[ECOMMENTS_FIELD.fieldApiName] = event.detail.draftValues[0].EComments__c;
        fields[PRIMARY_FIELD.fieldApiName] = event.detail.draftValues[0].Primary_Skill__c;
        fields[SECONDARY_FIELD.fieldApiName] = event.detail.draftValues[0].Secondary_Skill__c;

        const recordInput = {fields};
        console.log({fields});
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title:'Success',
                    message:'Employee list updated',
                    variant:'success'
                })
            );
            console.log("update record called");
            this.draftValues = [];

            return refreshApex(this.employee);
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title:'Error creating record',
                    message:error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}