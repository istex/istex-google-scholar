<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output encoding="UTF-8" method="xml" indent="yes"/>   
	
	<xsl:template match="/">
	<institutional_holdings>
			<xsl:apply-templates select="bacon/query/kbart/element"/>
	</institutional_holdings>
	</xsl:template>
	
	<xsl:template match="element">
		<item type="electronic">
			<xsl:apply-templates select="publication_title | print_identifier | online_identifier"/>
			<coverage>
				<from>
					<xsl:apply-templates select="date_first_issue_online | num_first_vol_online | num_first_issue_online"/>
				</from>
				<to>
					<xsl:apply-templates select="date_last_issue_online | num_last_vol_online | num_last_issue_online"/>
				</to>
			</coverage>
		</item>	
    </xsl:template>
	
	<xsl:template match="publication_title">
		<xsl:if test="text()">
			<title><xsl:value-of select="text()"/></title>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="print_identifier | online_identifier">
		<!-- it could be issn or isbn, we have to look at the publication type to know -->
        <xsl:variable name="itemType" select="../publication_type/text()"/>
        <xsl:if test="$itemType = 'serial'">
			<xsl:if test="text()">
				<issn><xsl:value-of select="text()"/></issn>
			</xsl:if>
		</xsl:if>
        <xsl:if test="$itemType = 'monograph'">
			<xsl:if test="text()">
				<isbn><xsl:value-of select="text()"/></isbn>
			</xsl:if>
		</xsl:if>

		<!-- note: can we put several issn? one for print issn, one for electronic issn, -->
		<!-- other from older versions of the title ?? -->
	</xsl:template>

	<xsl:template match="date_first_issue_online | date_last_issue_online">
		<xsl:if test="text()">
			<year><xsl:value-of select="text()"/></year>
		</xsl:if>	
	</xsl:template>

	<xsl:template match="num_first_vol_online | num_last_vol_online">
		<xsl:if test="text()">
			<volume><xsl:value-of select="text()"/></volume>
		</xsl:if>
	</xsl:template>

	<xsl:template match="num_first_issue_online | num_last_issue_online">
		<xsl:if test="text()">
			<issue><xsl:value-of select="text()"/></issue>
		</xsl:if>
	</xsl:template>

	<!-- note: there is no embargo related information in ISTEX for the moment -->

	

</xsl:stylesheet>