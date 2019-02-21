Feature: Search events
    I should be able to to the site and search for an event

    Scenario: Search events
        Given I have opened the site
        When I click Sign in
        When I enter username "superuser@test.com" and password "password"
        When I click on the user profile dropdown
        When I click on the menu item "Admin"

#When I type "bees" in the search bar
#Then I should see at least one result for "A literal swarm of Bees!"