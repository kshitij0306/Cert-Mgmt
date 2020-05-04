import { LightningElement, track, wire } from 'lwc';
import getCertReqList from '@salesforce/apex/CertReqController.getCertReqList';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Certification_Request__c.Id'
import NAME_FIELD from '@salesforce/schema/Certification_Request__c.Name';
import CERT_FIELD from '@salesforce/schema/Certification_Request__c.Certification__c';
import EMP_FIELD from '@salesforce/schema/Certification_Request__c.Employee__c';
import VOUCHER_FIELD from '@salesforce/schema/Certification_Request__c.Voucher__c';
import STATUS_FIELD from '@salesforce/schema/Certification_Request__c.Status__c';
import DATE_FIELD from '@salesforce/schema/Certification_Request__c.Due_Date__c';
import COMM_FIELD from '@salesforce/schema/Certification_Request__c.Comments__c';
import CERTREQ_OBJECT from '@salesforce/schema/Certification_Request__c';
import deleteCertReqList from '@salesforce/apex/CertReqController.deleteCertReqList';


const COLS = [
    { label:'Id', fieldName:'Name'},
    { label:'Certification', fieldName:'Certification__c', type:'lookup', typeAttributes: {
        placeholder: 'Select Certificate',
        uniqueId: { fieldName: 'Id' }, //pass Id of current record to lookup for context
        object: "Certification__c",
        icon: "standard:account",
        label: "Certification__c",
        displayFields: "Cert_Name__c",
        displayFormat: "Cert_Name__c",
        filters: ""
    }},
    { label:'Employee', fieldName:'Employee__c'},
    { label:'Voucher', fieldName:'Voucher__c'},
    { label:'Status', fieldName:'Status__c'},
    { label:'Due Date', fieldName:'Due_Date__c', type:'date', editable:true},
    { label:'Comments', fieldName:'Comments__c', editable:true}
];

export default class CertReqList extends LightningElement {
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track bShowModal = false;
    @track recordsCount = 0;
    @track buttonLabel = 'Delete';
    @track isTrue = false;

    selectedRecords = [];
    refreshTable;

    @wire(getCertReqList)
    certreq;

    openModal(){
        this.bShowModal = true;
    }

    closeModal(){
        this.bShowModal = false;
    }

    certReqObject = CERTREQ_OBJECT;
    myFields = [CERT_FIELD, EMP_FIELD, VOUCHER_FIELD, STATUS_FIELD, DATE_FIELD, COMM_FIELD];

    handleEmployeeCreated(){
        this.bShowModal = false;
    }
    getSelectedRecords(event){
        const selectedRows = event.detail.selectedRows;
        this.recordsCount = event.detail.selectedRows.length;
        let certReqIds = new Set();

        for(let i =0;i<selectedRows.length;i++){
            certReqIds.add(selectedRows[i].Id);
        }
        this.selectedRecords = Array.from(certReqIds);
    }

    deleteCertificationRequest(){
        if(this.selectedRecords) {
            this.buttonLabel = 'Processing...';
            this.isTrue = true;
            this.deleteCertReqs();
        }
    }
    
    deleteCertReqs(){
        deleteCertReqList({lstCertReqIds : this.selectedRecords})
        .then(result => {
            this.buttonLabel = 'Delete';
            this.isTrue = false;
            this.dispatchEvent(
                new ShowToastEvent({
                title:'Successfully deleted!',
                message: this.recordsCount + ' Certification Requests are deleted.',
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
                    title: 'Error while getting Certification Requests', 
                    message: error.message, 
                    variant: 'error'
                }),
            );
        });
    }

    handleSave(event) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[DATE_FIELD.fieldApiName] = event.detail.draftValues[0].Due_Date__c;
        fields[COMM_FIELD.fieldApiName] = event.detail.draftValues[0].Comments__c;
        fields[CERT_FIELD.fieldApiName] = event.detail.draftValues[0].Certification__c;
        const recordInput = {fields};
        updateRecord(recordInput)
        .then(() =>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title:'Success',
                    message:'Certification Request list updated',
                    variant:'success'
                })
            );
            this.draftValues = [];

            return refreshApex(this.certreq);
        }).catch(error =>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title:'Error creating record',
                    message:error.body.message,
                    variant:'error'
                })
            );
        });
    }
    
}