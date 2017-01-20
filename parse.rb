require 'net/http'
require 'json'
require 'open-uri'
require 'smarter_csv'
require 'erb'
require 'tilt'

def get_all_sheets(spreadsheet_key)
	url = "https://spreadsheets.google.com/feeds/worksheets/#{spreadsheet_key}/public/basic?alt=json"
	uri = URI(url)
	response = Net::HTTP.get(uri)
	json = JSON.parse(response)

	sheets = []
	json['feed']['entry'].each do |entry|
		sheet = {}
		sheet[:slug] = entry['title']['$t']
		sheet[:csv_url] = entry['link'].select {|l| l['type'] == 'text/csv'}.first['href']
		sheets << sheet
	end

	toc = []
	sheets.each do |sheet|
		chapter_data = get_sheet_data(sheet[:csv_url])

		title = chapter_data[:title]
		slug = sheet[:slug]
		render_chapter(chapter_data, slug)

		contents_entry = {}
		contents_entry[:slug] = slug
		contents_entry[:title_or] = title[:original]
		contents_entry[:title_en] = title[:english]
		contents_entry[:title_es] = title[:spanish]
		toc << contents_entry
	end
	puts toc
end

def get_sheet_data(sheet_csv_url)
	open(sheet_csv_url, 'r:utf-8') do |f|
		data = SmarterCSV.process(f)
		html = parse_sheet_data(data)

		ret = {}
		ret[:title]	= data.select{|d| d[:type].downcase == 'title'}.first
		ret[:html] 	= html

		# return the title row
		return ret
	end
end

def parse_sheet_data(data)
	original = []
	english = []
	spanish = []

	data.each_with_index do |row, row_index|
		html_open = ''
		html_close = ''

		case row[:type].downcase
		when 'title'
			html_open 	= '<h1>'
			html_close 	= '</h1>'
		when 'subtitle'
			html_open 	= '<h2>'
			html_close	= '</h2>'
		when 'date'
			html_open	= '<div class="date">'
			html_close	= '</div>'
		when 'by'
			html_open	= '<div class="by">'
			html_close	= '</div>'
		when 'about'
			html_open	= '<div class="about">'
			html_close	= '</div>'
		when 'sub'
			html_open	= '<h3>'
			html_close	= '</h3>'
		when 'subauth'
			html_open	= '<div class="sub_by">'
			html_close	= '</div>'
		when 'subsub'
			html_open	= '<h4>'
			html_close	= '</h4>'
		when 'body'
			html_open	= '<p>'
			if data[row_index+1] && data[row_index+1][:type].downcase == 'line'
				html_close = ''
			else
				html_close = '</p>'
			end
		when 'line'
			html_open	= '<br>'
			if data[row_index+1] && data[row_index+1][:type].downcase == 'line'
				html_close = ''
			else
				html_close = '</p>'
			end
		when 'indent'
			html_open	= '<p class="indent">'
			html_close	= '</p>'
		when 'blockquote'
			html_open	= '<blockquote><p>'
			if data[row_index+1] && data[row_index+1][:type].downcase == 'bqline'
				html_close = '</p>'
			else
				html_close = '</p></blockquote>'
			end
		when 'bqline'
			html_open	= '<p>'
			if data[row_index+1] && data[row_index+1][:type].downcase == 'bqline'
				html_close = '</p>'
			else
				html_close = '</p></blockquote>'
			end
		when 'bqattr'
			html_open	= '<div class="blockquote_by">'
			html_close	= '</div>'
		when 'tweet'
			html_open	= '<div class="tweet">'
			html_close	= '</div>'
		when 'twtattr'
			html_open	= '<div class="tweet_meta">'
			html_close	= '</div>'
		end

		original_html = html_open + format_text(row[:original]) + html_close
		original << original_html
		english_html = html_open + format_text(row[:english]) + html_close
		english << english_html

		if !row[:spanish].nil?
			spanish_html = html_open + format_text(row[:spanish]) + html_close
			spanish << spanish_html
		end
	end

	html = {}
	html[:original]	= original.join("\n")
	html[:english]	= english.join("\n")
	html[:spanish]	= spanish.join("\n")

	return html
end

def format_text(text)
	ital = /(\*(.+?)\*)/			# *text*
	bold = /(\*\*(.+?)\*\*)/		# **text**
	smallcaps = /(\^\^(.+?)\^\^)/	# ^^text^^
	fn = /(\[\^(\d+)\])/			# [^1], [^2]

	text.gsub!(ital, '<em>\2</em>')
	text.gsub!(bold, '<strong>\2</em>')
	text.gsub!(smallcaps, '<span class="smallcaps">\2</span>')
	text.gsub!(fn, '<a href="#fn\2" class="fn">\2</a>')

	return text
end

def render_chapter(chapter_data, slug)
	template = Tilt.new('chapter.html.erb')
	fname = "render/chapters/#{slug}.html"
	html = template.render(self, chapter_data: chapter_data)
	File.write(fname, html)
	puts "#{slug} done"
end

get_all_sheets('1x3mZhY0j5wXUnAnVwumKk5bSuqh2Xx6_9Srt0jbMVpE')