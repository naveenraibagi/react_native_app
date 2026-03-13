import React, { useState } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts, searchProductNames } from '../../services/products.service';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function SearchScreen({ navigation }: any) {
    const { colors, spacing, radius, fonts } = useTheme();
    const [query, setQuery] = useState('');
    const [committed, setCommitted] = useState('');

    const { data: suggestions } = useQuery({
        queryKey: ['suggestions', query],
        queryFn: () => searchProductNames(query),
        enabled: query.length > 1 && !committed,
        staleTime: 30000,
    });

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', committed],
        queryFn: () => fetchProducts({ search: committed, perPage: 30 }),
        enabled: committed.length > 0,
    });

    const s = st(colors, spacing, radius, fonts);

    return (
        <View style={s.flex}>
            {/* Search Bar */}
            <View style={s.searchBar}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                    style={s.input}
                    placeholder="Search products..."
                    placeholderTextColor={colors.textMuted}
                    value={query}
                    onChangeText={(t) => { setQuery(t); if (!t) setCommitted(''); }}
                    onSubmitEditing={() => { setCommitted(query); }}
                    returnKeyType="search"
                    autoFocus
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setQuery(''); setCommitted(''); }}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Suggestions */}
            {!committed && suggestions && suggestions.length > 0 && (
                <View style={s.suggestions}>
                    {suggestions.map((sug, i) => (
                        <TouchableOpacity
                            key={i}
                            style={s.suggRow}
                            onPress={() => { setQuery(sug); setCommitted(sug); }}
                        >
                            <Ionicons name="search-outline" size={15} color={colors.textSecondary} />
                            <Text style={s.suggText}>{sug}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Results */}
            {committed && isLoading && <SkeletonLoader rows={3} cols={2} cardHeight={220} />}
            {committed && !isLoading && results && results.length === 0 && (
                <EmptyState icon="search-outline" title={`No results for "${committed}"`} subtitle="Try a different keyword" />
            )}
            {committed && results && results.length > 0 && (
                <FlatList
                    data={results}
                    numColumns={2}
                    keyExtractor={(i) => String(i.id)}
                    contentContainerStyle={{ padding: spacing.base, gap: spacing.md, paddingBottom: 120 }}
                    columnWrapperStyle={{ gap: spacing.md }}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                    ListHeaderComponent={
                        <Text style={s.resultCount}>{results.length} results for "{committed}"</Text>
                    }
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                            style={{ flex: 1 }}
                        />
                    )}
                />
            )}
            {!committed && !suggestions?.length && (
                <EmptyState icon="search-outline" title="Find your products" subtitle="Type above to search across all products" />
            )}
        </View>
    );
}

const st = (colors: any, spacing: any, radius: any, fonts: any) =>
    StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background, paddingTop: 70 },
        searchBar: {
            flexDirection: 'row', alignItems: 'center', gap: 10,
            margin: spacing.base, paddingHorizontal: spacing.md, height: 48,
            backgroundColor: colors.inputBg, borderRadius: radius.full,
            borderWidth: 1.5, borderColor: colors.border,
        },
        input: { flex: 1, color: colors.text, fontSize: fonts.sizes.base },
        suggestions: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
        suggRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.base, paddingVertical: 12 },
        suggText: { fontSize: fonts.sizes.base, color: colors.text },
        resultCount: { fontSize: fonts.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
    });
