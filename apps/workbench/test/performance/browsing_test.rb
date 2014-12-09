# http://guides.rubyonrails.org/v3.2.13/performance_testing.html

require 'test_helper'
require 'rails/performance_test_help'
require 'integration_helper'
require 'selenium-webdriver'
require 'headless'

class BrowsingTest < ActionDispatch::PerformanceTest
  # Refer to the documentation for all available options
  # self.profile_options = { :runs => 5, :metrics => [:wall_time, :memory]
  #                          :output => 'tmp/performance', :formats => [:flat] }

  self.profile_options = { :runs => 10,
                           :metrics => [:wall_time],
                           :output => 'tmp/performance',
                           :formats => [:flat] }

  setup do
    headless = Headless.new
    headless.start
    Capybara.current_driver = :selenium
    Capybara.current_session.driver.browser.manage.window.resize_to(1024, 768)
  end

  def test_homepage
    visit page_with_token('active')
    assert_text 'Dashboard'
    assert_selector 'a', text: 'Run a pipeline'
  end
end
