import { LightningElement, track, wire } from 'lwc';
import getVoucherList from '@salesforce/apex/VoucherController.getVoucherList';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Voucher__c.Id';
import VID_FIELD from '@salesforce/schema/Voucher__c.Name';
import COST_FIELD from '@salesforce/schema/Voucher__c.Voucher_Cost__c';
import ACTIVE_FIELD from '@salesforce/schema/Voucher__c.Active__c';
import VALIDITY_FIELD from '@salesforce/schema/Voucher__c.Validity__c';
import CERT_FIELD from '@salesforce/schema/Voucher__c.Certification__c';
import COMM_FIELD from '@salesforce/schema/Voucher__c.Comments__c';
import VOUCHER_OBJECT from '@salesforce/schema/Voucher__c';
import deleteVoucherList from '@salesforce/apex/VoucherController.deleteVoucherList';


const COLS = [
    { label:'Id', fieldName:'Name'},
    { label:'Certification', fieldName:'Certification__c'},
    { label:'Cost', fieldName:'Voucher_Cost__c',type:'currency', editable:true},
    { label:'Active', fieldName:'Active__c', type:'boolean'},
    { label:'Validity', fieldName:'Validity__c', type:'date', editable:true},
    { label:'Comments', fieldName:'Comments__c', editable:true }

];

export default class VoucherList extends LightningElement {
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track bShowModal = false;
    @track recordsCount = 0;
    @track buttonLabel = 'Delete';
    @track isTrue = false;

    selectedRecords = [];
    refreshTable;

    @wire(getVoucherList)
    voucher;

    openModal(){
        this.bShowModal = true;
    }

    closeModal(){
        this.bShowModal = false;
    }

    voucherObject = VOUCHER_OBJECT;
    myFields = [COST_FIELD, ACTIVE_FIELD, CERT_FIELD, VALIDITY_FIELD, COMM_FIELD];

    handleVoucherCreated(){
        this.bShowModal = false;
    }

    getSelectedRecords(event){
        const selectedRows = event.detail.selectedRows;
        this.recordsCount = event.detail.selectedRows.length;
        let vouIds = new Set();

        for(let i =0;i<selectedRows.length;i++){
            vouIds.add(selectedRows[i].Id);
        }
        this.selectedRecords = Array.from(vouIds);
    }

    deleteVouchers(){
        if(this.selectedRecords) {
            this.buttonLabel = 'Processing...';
            this.isTrue = true;
            this.deleteVous();
        }
    }

    deleteVous(){
        deleteVoucherList({lstVouIds : this.selectedRecords})
        .then(result => {
            this.buttonLabel = 'Delete';
            this.isTrue = false;
            this.dispatchEvent(
                new ShowToastEvent({
                title:'Successfully deleted!',
                message: this.recordsCount + ' Vouchers are deleted.',
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
                    title: 'Error while getting Contacts', 
                    message: error.message, 
                    variant: 'error'
                }),
            );
        });
    }
    handleSave(event) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[VID_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[COST_FIELD.fieldApiName] = event.detail.draftValues[0].Voucher_Cost__c;
        fields[ACTIVE_FIELD.fieldApiName] = event.detail.draftValues[0].Active__c;
        fields[VALIDITY_FIELD.fieldApiName] = event.detail.draftValues[0].Validity__c;
        fields[COMM_FIELD.fieldApiName] = event.detail.draftValues[0].Comments__c;

        const recordInput = {fields};
        //console.log({fields});
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title:'Success',
                    message:'Employee list updated',
                    variant:'success'
                })
            );
            //console.log("update record called");
            this.draftValues = [];

            return refreshApex(this.voucher);
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