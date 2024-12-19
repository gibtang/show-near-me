import pandas as pd
import os  # Add this import at the top
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import json
from datetime import datetime
from textwrap import wrap

def register_unicode_font():
    """
    Register a Unicode-compatible font for PDF generation.
    Returns True if successful, False if falling back to default font.
    """
    try:
        # First try DejaVuSans if available (comes with many systems)
        font_paths = [
            # "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "/Library/Fonts/Arial Unicode.ttf",  # MacOS
            # "C:/Windows/Fonts/arial.ttf",  # Windows
            # "DejaVuSans.ttf",  # Current directory
            "Arial-Unicode-Regular.ttf"  # Current directory
        ]

        for font_path in font_paths:
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('UniFont', font_path))
                print(f"Successfully registered font: {font_path}")
                return True

        print("No Unicode font found, falling back to default font")
        return False
    except Exception as e:
        print(f"Warning: Could not register Unicode font: {e}")
        print("Falling back to built-in font - some characters may not display correctly")
        return False

def process_merchant_data(input_file):
    """Read and process the merchant data CSV file with Unicode support."""
    try:
        # Try UTF-8 first
        df = pd.read_csv(input_file, encoding='utf-8')
    except UnicodeDecodeError:
        try:
            # Try alternative encoding if UTF-8 fails
            df = pd.read_csv(input_file, encoding='gb18030')
        except Exception as e:
            print(f"Error processing file with alternative encoding: {e}")
            return None

    try:
        # Clean and prepare data
        df = df[['Store', 'MCC', 'Type']].drop_duplicates()
        df = df.sort_values('Store')
        df = df.fillna('')  # Replace NaN with empty string

        # Convert MCC to string and ensure it's formatted correctly
        df['MCC'] = df['MCC'].astype(str).str.strip()

        return df
    except Exception as e:
        print(f"Error processing data: {e}")
        return None

def create_metadata_section(merchant_data):
    """Create metadata about the dataset for RAG context."""
    metadata = {
        "document_type": "Merchant Reference Guide",
        "total_merchants": len(merchant_data),
        "unique_mccs": len(merchant_data['MCC'].unique()),
        "mcc_categories": len(merchant_data['Type'].unique()),
        "generation_date": datetime.now().strftime("%Y-%m-%d"),
        "data_source": "merchant_transactions",
        "version": "1.0",
        "last_updated": datetime.now().isoformat(),
        "category_distribution": merchant_data['Type'].value_counts().to_dict(),
        "mcc_distribution": merchant_data['MCC'].value_counts().to_dict(),
        "data_fields": {
            "merchant_name": "Business name as appears in transactions",
            "mcc": "Merchant Category Code - standardized industry classification",
            "business_type": "Description of merchant's primary business activity"
        }
    }
    return metadata

def create_mcc_summary(merchant_data):
    """Create a summary of MCC codes and their meanings."""
    mcc_summary = merchant_data.groupby(['MCC', 'Type']).size().reset_index()
    mcc_summary = mcc_summary.rename(columns={0: 'count'})
    mcc_summary = mcc_summary.sort_values('count', ascending=False)

    # Add percentage of total
    total_merchants = len(merchant_data)
    mcc_summary['percentage'] = (mcc_summary['count'] / total_merchants * 100).round(2)

    return mcc_summary

def create_search_optimized_content(merchant_data):
    """Create alternative search-friendly merchant listings."""
    search_content = []

    for _, row in merchant_data.iterrows():
        # Create variations and patterns for each merchant
        merchant_name = str(row['Store'])
        mcc_code = str(row['MCC'])
        business_type = str(row['Type'])

        entry = {
            "merchant_name": merchant_name,
            "merchant_name_lower": merchant_name.lower(),
            "merchant_name_variations": [
                merchant_name,
                merchant_name.lower(),
                merchant_name.upper(),
                merchant_name.replace(" ", ""),
                merchant_name.replace(" ", "_"),
            ],
            "mcc_code": mcc_code,
            "business_type": business_type,
            "search_key": f"{merchant_name} {mcc_code} {business_type}",
            "search_key_normalized": f"{merchant_name.lower()} {mcc_code} {business_type.lower()}",
            "qa_pairs": [
                {
                    "question": f"What is the MCC for {merchant_name}?",
                    "answer": f"The MCC for {merchant_name} is {mcc_code}"
                },
                {
                    "question": f"What type of business is {merchant_name}?",
                    "answer": f"{merchant_name} is a {business_type} business with MCC {mcc_code}"
                },
                {
                    "question": f"What is the business category for {merchant_name}?",
                    "answer": f"{merchant_name} operates in the {business_type} category (MCC: {mcc_code})"
                }
            ],
            "metadata": {
                "has_unicode": any(ord(c) > 127 for c in merchant_name),
                "name_length": len(merchant_name),
                "contains_numbers": any(c.isdigit() for c in merchant_name)
            }
        }
        search_content.append(entry)

    return search_content

def create_paragraph_cell(text, style):
    """Create a paragraph cell for tables that will auto-wrap."""
    return Paragraph(str(text), style)

def wrap_text_in_table(data, col_widths, styles):
    """Convert table data to use paragraphs for auto-wrapping."""
    wrapped_data = []
    for row in data:
        wrapped_row = []
        for idx, cell in enumerate(row):
            # Convert to string and create paragraph for all cells except MCC (which is column 1)
            if idx != 1:  # Not the MCC column
                cell_str = str(cell)
                wrapped_row.append(create_paragraph_cell(cell_str, styles['table_cell']))
            else:
                wrapped_row.append(cell)  # Keep MCC as is
        wrapped_data.append(wrapped_row)
    return wrapped_data

def create_merchant_pdf_enhanced(merchant_data, output_file, unicode_font_available):
    """Create a comprehensive PDF document with all information."""
    doc = SimpleDocTemplate(
        output_file,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )

    story = []
    styles = getSampleStyleSheet()

    # Create custom styles
    custom_styles = {
        'header': ParagraphStyle(
            'CustomHeader',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            fontName='UniFont' if unicode_font_available else 'Helvetica'
        ),
        'section': ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            fontName='UniFont' if unicode_font_available else 'Helvetica'
        ),
        'subsection': ParagraphStyle(
            'SubSectionHeader',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=15,
            fontName='UniFont' if unicode_font_available else 'Helvetica'
        ),
        'normal': ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            fontName='UniFont' if unicode_font_available else 'Helvetica'
        ),
        'table_cell': ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            fontName='UniFont' if unicode_font_available else 'Helvetica'
        )
    }

    # 1. Title Page
    story.append(Paragraph("Merchant Category Code (MCC)", custom_styles['header']))
    story.append(Paragraph("Complete Reference Guide", custom_styles['header']))
    story.append(Spacer(1, 50))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", custom_styles['normal']))
    story.append(PageBreak())

    # 2. Table of Contents
    story.append(Paragraph("Table of Contents", custom_styles['header']))
    toc_items = [
        "1. Document Metadata",
        "2. MCC Code Summary",
        "3. Complete Merchant Listing",
        "4. Search Reference Guide",
        "5. Merchant Variations",
        "6. Question-Answer Reference"
    ]
    for item in toc_items:
        story.append(Paragraph(item, custom_styles['normal']))
    story.append(PageBreak())

    # 3. Metadata Section
    story.append(Paragraph("1. Document Metadata", custom_styles['header']))
    metadata = create_metadata_section(merchant_data)
    metadata_text = json.dumps(metadata, indent=2, ensure_ascii=False)
    story.append(Paragraph(f"<pre>{metadata_text}</pre>", custom_styles['normal']))
    story.append(PageBreak())

    # 4. MCC Summary Section
    story.append(Paragraph("2. MCC Code Summary", custom_styles['header']))
    mcc_summary = create_mcc_summary(merchant_data)

    mcc_col_widths = [1*inch, 4*inch, 1*inch, 1*inch]
    mcc_table_data = [['MCC', 'Business Type', 'Count', 'Percentage']] + [
        [str(row['MCC']),
         str(row['Type']),
         str(row['count']),
         f"{row['percentage']}%"]
        for _, row in mcc_summary.iterrows()
    ]
    wrapped_mcc_data = wrap_text_in_table(mcc_table_data, mcc_col_widths, custom_styles)
    mcc_table = Table(wrapped_mcc_data, colWidths=mcc_col_widths, repeatRows=1)
    mcc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(mcc_table)
    story.append(PageBreak())

    # 5. Main Merchant Listing
    story.append(Paragraph("3. Complete Merchant Listing", custom_styles['header']))
    main_col_widths = [2.5*inch, 1*inch, 3.5*inch]
    main_data = [['Merchant Name', 'MCC', 'Business Type']] + merchant_data.values.tolist()
    wrapped_main_data = wrap_text_in_table(main_data, main_col_widths, custom_styles)
    main_table = Table(wrapped_main_data, colWidths=main_col_widths, repeatRows=1)
    main_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(main_table)
    story.append(PageBreak())

    # 6. Search Reference Guide
    story.append(Paragraph("4. Search Reference Guide", custom_styles['header']))
    search_content = create_search_optimized_content(merchant_data)

    for i, entry in enumerate(search_content, 1):
        if i % 3 == 1:  # Add page break every 3 entries
            if i > 1:
                story.append(PageBreak())

        # Merchant header
        story.append(Paragraph(f"Merchant: {entry['merchant_name']}", custom_styles['subsection']))

        # Basic info
        story.append(Paragraph(f"MCC: {entry['mcc_code']}", custom_styles['normal']))
        story.append(Paragraph(f"Business Type: {entry['business_type']}", custom_styles['normal']))

        # Search variations
        story.append(Paragraph("Search Variations:", custom_styles['normal']))
        for var in entry['merchant_name_variations']:
            story.append(Paragraph(f"- {var}", custom_styles['normal']))

        # QA pairs
        story.append(Paragraph("Common Questions:", custom_styles['normal']))
        for qa in entry['qa_pairs']:
            story.append(Paragraph(f"Q: {qa['question']}", custom_styles['normal']))
            story.append(Paragraph(f"A: {qa['answer']}", custom_styles['normal']))

        story.append(Spacer(1, 20))

    # Build PDF
    doc.build(story)


def main():
    """Main function to process data and create PDF."""
    input_file = "merchant_data_20241031_152616.csv"
    output_pdf = "merchant_mcc_reference_complete.pdf"

    try:
        # Register Unicode font
        unicode_font_available = register_unicode_font()

        # Process merchant data
        print("Processing merchant data...")
        merchant_data = process_merchant_data(input_file)

        if merchant_data is not None:
            # Create enhanced PDF
            print("Creating comprehensive PDF document...")
            create_merchant_pdf_enhanced(merchant_data, output_pdf, unicode_font_available)
            print(f"PDF document created successfully: {output_pdf}")

    except Exception as e:
        print(f"Error in main process: {e}")
        raise e

if __name__ == "__main__":
    main()
