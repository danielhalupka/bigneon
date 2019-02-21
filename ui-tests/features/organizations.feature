Feature: Manage organizations

  Scenario: Create an organization
    Given I have logged in as "Admin"
      And I have opened Big Neon Studio
      When I wait 2 seconds
     When I click on the Organizations menu
      And I create an organization "Test", "+ 2 (112) 123-1231", "161 Smit Street"

  
