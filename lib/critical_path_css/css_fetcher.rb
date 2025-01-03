require 'json'
require 'open3'

module CriticalPathCss
  class CssFetcher
    GEM_ROOT = File.expand_path(File.join('..', '..'), File.dirname(__FILE__))

    def initialize(config)
      @config = config
    end

    def fetch
      @config.routes.map { |route| [route, fetch_route(route)] }.to_h
    end

    def fetch_route(route)
      options = {
        'url' => @config.base_url + route,
        'css' => @config.path_for_route(route),
        'width' => 1300,
        'height' => 900,
        'timeout' => 30_000,
        # CSS selectors to always include, e.g.:
        'forceInclude' => [
          #  '.keepMeEvenIfNotSeenInDom',
          #  '^\.regexWorksToo'
        ],
        # set to true to throw on CSS errors (will run faster if no errors)
        'strict' => false,
        # characters; strip out inline base64 encoded resources larger than this
        'maxEmbeddedBase64Length' => 10_000,
        # specify which user agent string when loading the page
        'userAgent' => 'Penthouse Critical Path CSS Generator',
        # ms; render wait timeout before CSS processing starts (default: 100)
        'renderWaitTime' => 1000,
        # set to false to load (external) JS (default: true)
        'blockJSRequests' => true,
        'customPageHeaders' => {
          # use if getting compression errors like 'Data corrupted':
          'Accept-Encoding' => 'identity'
        }
      }.merge(@config.penthouse_options)
      out, err, st = if Gem::Version.new(RUBY_VERSION) >= Gem::Version.new('2.5.0')
                       Open3.capture3('node', 'lib/fetch-css.js', JSON.dump(options), chdir: GEM_ROOT)
                     else
                       Dir.chdir(GEM_ROOT) do
                         Open3.capture3('node', 'lib/fetch-css.js', JSON.dump(options))
                       end
                     end
      if (st.present? && !st.exitstatus.zero?) || out.empty? && !err.empty?
        STDOUT.puts out
        STDERR.puts err
        STDERR.puts "Failed to get CSS for route #{route}\n" \
              "  with options=#{options.inspect}"
      end
      out
    end
  end
end
