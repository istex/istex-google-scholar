<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output encoding="UTF-8" method="xml" indent="yes" doctype-public="-//GOOGLE//Institutional Holdings 1.0//EN" doctype-system="http://scholar.google.com/scholar/institutional_holdings.dtd"/>   
	
	<xsl:template match="/">
	<institutional_holdings>
			<xsl:apply-templates select="query/kbart"/>
	</institutional_holdings>
	</xsl:template>
	
	<xsl:template match="kbart">
		<item type="electronic">
			<!-- note: given the DTD we can put only one issn --> 
			<!-- although we always have one for print issn and one for electronic issn, -->
			<!-- and possibly other from older versions of the title -->
			<!-- by default we prioritize here print issn -->
			<!-- question sent to Google Scholar support: shall we add several <item> kbart -->
			<!-- for the same journal for each its different possible issn numbers? -->
			<xsl:choose>
	         	<xsl:when test="print_identifier">
	           	 	<xsl:apply-templates select="publication_title | print_identifier"/>
	         	</xsl:when>
	         	<xsl:when test="online_identifier">
	           	 	<xsl:apply-templates select="publication_title | online_identifier"/>
	         	</xsl:when>
	         	<xsl:otherwise>
	          	  	<xsl:apply-templates select="publication_title"/>
	         	</xsl:otherwise>
	       </xsl:choose>
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