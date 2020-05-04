import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CERTIFICATION_OBJECT from '@salesforce/schema/Certification__c';
import CERT_ID from '@salesforce/schema/Certification__c.Name';

export default class CertificateCreateRecord extends LightningElement {
    certId;
    name = '';

    handleNameChange(event){
        this.certId = undefined;
        this.name = event.target.value;
    }
    createCertificate(event) {
        console.log("bhfudbhsubvdv");
        const fields = {};
        fields[CERT_ID.fieldApiName] = this.name;
        const recordInput = {apiName: CERTIFICATION_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then( certification =>{
                this.certId = certification.id;
                
                 
            });
    }

}