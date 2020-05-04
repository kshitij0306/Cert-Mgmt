public with sharing class EmployeeController {
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployeeList(){
        return [
            SELECT Id, Name, Emp_Name__c, Email__c, Experience__c, Comments__c, Primary_Skill__c, Secondary_Skill__c
            FROM Employee__c
            WITH SECURITY_ENFORCED
            LIMIT 10
        ];
    }
    @AuraEnabled
    public static void deleteEmployeeList(List<Id> lstEmpIds){
        try {
            List<Employee__c> listEmpToDelete = new list<Employee__c> ();

            for(Id idEmp : lstEmpIds) { 
                listEmpToDelete.add(new Employee__c(Id = idEmp));
            }

            if(!listEmpToDelete.isEmpty()) {
                delete listEmpToDelete;
            }
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    public EmployeeController() {

    }
}