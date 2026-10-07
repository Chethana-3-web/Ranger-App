$content = Get-Content -Raw "src/core/ui/AppHeader.js"

$newHeader = @"
const AppHeader = ({ title, subtitle, onBack, onClose, accentColor = COLORS.HEADER_BG }) => {
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: accentColor }]}>
      <View style={styles.row}>
        {/* Back button */}
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Right close button or spacer */}
        {onClose ? (
          <TouchableOpacity
            onPress={onClose}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
};
"@

$content = $content -replace "(?s)const AppHeader = .*?^};", $newHeader
Set-Content -Path "src/core/ui/AppHeader.js" -Value $content
