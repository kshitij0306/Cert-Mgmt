import { LightningElement, wire, track } from 'lwc';
import getCertificationList from '@salesforce/apex/CertificationController.getCertificationList';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import IdFIELD from '@salesforce/schema/Certification__c.Name';
import CERTNAME_FIELD from '@salesforce/schema/Certification__c.Cert_Name__c';
import COMMENTS_FIELD from '@salesforce/schema/Certification__c.Comments__c';
import ID_FIELD from '@salesforce/schema/Certification__c.Id';
import CERTIFICATION_OBJECT from '@salesforce/schema/Certification__c';
import CERTNAME2_FIELD from '@salesforce/schema/Certification__c.Cert_Name__c';
import COMMENTS2_FIELD from '@salesforce/schema/Certification__c.Comments__c';
import deleteCertificationList from '@salesforce/apex/CertificationController.deleteCertificationList';


const COLS = [
    {label: 'Certification Id', fieldName:'Name'},
    {label: 'Certification Name', fieldName:'Cert_Name__c', editable: true},
    {label: 'Comments', fieldName:'Comments__c', editable: true}
];

export default class CertificationList extends LightningElement {
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track bShowModal = false;
    @track recordsCount = 0;
    @track buttonLabel = 'Delete';
    @track isTrue = false;


    selectedRecords = [];
    refreshTable;

    @wire(getCertificationList)
    certification;
    openModal(){
        this.bShowModal = true;
    }

    closeModal(){
        this.bShowModal = false;
    }

    certificationObject = CERTIFICATION_OBJECT;
    myFields = [CERTNAME2_FIELD , COMMENTS2_FIELD];

    handleCertificationCreated(){
        // Run code when account is created.
        this.bShowModal = false;
                
    }

    getSelectedRecords(event) {
        const selectedRows = event.detail.selectedRows;
        this.recordsCount = event.detail.selectedRows.length;
        let certIds = new Set();

        for(let i =0;i<selectedRows.length;i++){
            certIds.add(selectedRows[i].Id);
        }

        this.selectedRecords = Array.from(certIds);
    }

    deleteCertifications(){
        if(this.selectedRecords) {
            this.buttonLabel = 'Processing...';
            this.isTrue = true;
            this.deleteCerts();
        }
    }

    deleteCerts(){
        deleteCertificationList({lstCertIds: this.selectedRecords})
        .then(result => {
            this.buttonLabel = 'Delete';
            this.isTrue = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                    title:'Successfully deleted!',
                    message: this.recordsCount + ' Certifications are deleted.',
                    variant: 'success'
                }),
            );
            this.template.querySelector('lightning-datatable').selectedRows = [];
            this.recordsCount = 0;
            return refreshApex(this.refreshTable);
        })
        .catch(error => {
            window.console.log(error);
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
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
    
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(contacts => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contacts updated',
                    variant: 'success'
                })
            );
             // Clear all draft values
             this.draftValues = [];
    
             // Display fresh data in the datatable
             return refreshApex(this.contact);
        }).catch(error => {
            // Handle error
        });
    }
}