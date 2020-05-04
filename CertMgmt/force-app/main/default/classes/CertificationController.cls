public with sharing class CertificationController {
    @AuraEnabled(cacheable=true)
    public static List<Certification__c> getCertificationList(){
        return [
            SELECT Id, Name, Cert_name__c, Comments__c 
            FROM Certification__c 
            LIMIT 10
            ];
    }

    @AuraEnabled
    public static void deleteCertificationList(List<Id> lstCertIds){
        try {
            List<Certification__c> listCertToDelete = new list<Certification__c> ();

            for(Id idCert : lstCertIds) { 
                listCertToDelete.add(new Certification__c(Id = idCert));
            }

            if(!listCertToDelete.isEmpty()) {
                delete listCertToDelete;
            }
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    public CertificationController() {

    }
}