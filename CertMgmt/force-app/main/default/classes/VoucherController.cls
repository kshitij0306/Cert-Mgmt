public with sharing class VoucherController {
    @AuraEnabled(cacheable=true)
    public static List<Voucher__c> getVoucherList(){
        return[
            SELECT Id, Name, Voucher_Cost__c, Active__c, Validity__c, Certification__c, Comments__c
            FROM Voucher__c
            WITH SECURITY_ENFORCED
            LIMIT 10
        ];
        
    }
    @AuraEnabled
    public static void deleteVoucherList(List<Id> lstVouIds){
        try {
            List<Voucher__c> listVouToDelete = new list<Voucher__c> ();
            for(Id idVou : lstVouIds){
                listVouToDelete.add(new Voucher__c(Id = idVou));
            }

            if(!listVouToDelete.isEmpty()) {
                delete listVouToDelete;
            }

        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        
    }
    public VoucherController() {

    }
}