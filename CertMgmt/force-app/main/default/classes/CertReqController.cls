public with sharing class CertReqController {
    @AuraEnabled(cacheable=true)
    public static List<Certification_Request__c> getCertReqList(){
        return [
            SELECT Id, Name, Certification__c, Voucher__c, Employee__c, Status__c, Due_Date__c, Comments__c
            FROM Certification_Request__c
            WITH SECURITY_ENFORCED
            LIMIT 10
        ];
    }
    @AuraEnabled
    public static void deleteCertReqList(List<Id> lstCertReqIds){
        try {
            List<Certification_Request__c> listCertReqToDelete = new list<Certification_Request__c> ();

            for(Id idCertReq : lstCertReqIds) {
                listCertReqToDelete.add(new Certification_Request__c(Id = idCertReq));
            }

            if(!listCertReqToDelete.isEmpty()){
                delete listCertReqToDelete;
            }
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        
    }
    public CertReqController() {

    }
}
