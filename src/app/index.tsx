import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type Message = { id: string; name: string; text: string; createdAt: string };
const API = process.env.EXPO_PUBLIC_API_URL || '';
export default function Board() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function request(path: string, options?: RequestInit) {
    if (!API) throw new Error('The board is not connected yet. Set EXPO_PUBLIC_API_URL and restart Expo.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${API.replace(/\/$/, '')}${path}`, { ...options, signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The server could not complete the request.');
      return data;
    } finally { clearTimeout(timer); }
  }
  async function refresh() {
    setLoading(true); setError('');
    try { setMessages((await request('/messages')).messages); }
    catch { setError(API ? 'Could not load messages. Check your connection and try Refresh.' : 'The board is not connected yet.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  async function post() {
    setPosting(true); setError(''); setNotice('');
    try {
      const saved: Message = await request('/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), text: text.trim() }) });
      setMessages(current => [saved, ...current].slice(0, 100)); setText(''); setNotice('Your message is posted.');
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'Connection timed out. Refresh before retrying to check whether your message was saved.'); }
    finally { setPosting(false); }
  }
  const disabled = posting || !name.trim() || !text.trim() || !API;
  return <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
    <Text style={s.eyebrow}>A LITTLE SPACE TO SHARE</Text>
    <Text style={s.title}>Pocket Board<Text style={s.dot}>.</Text></Text>
    <Text style={s.subtitle}>Leave a thought. Say hello. Keep the conversation going.</Text>
    <View style={s.card}>
      <Text style={s.heading}>What’s on your mind?</Text>
      <Text style={s.label}>Your name</Text>
      <TextInput accessibilityLabel="Your name" style={s.input} value={name} onChangeText={setName} maxLength={30} placeholder="e.g. Suyash" placeholderTextColor="#7c837f" editable={!posting} />
      <Text style={s.label}>Message</Text>
      <TextInput accessibilityLabel="Message" style={[s.input,s.message]} value={text} onChangeText={setText} maxLength={280} multiline placeholder="Something worth sharing…" placeholderTextColor="#7c837f" editable={!posting} />
      <View style={s.row}><Text accessibilityLiveRegion="polite" style={s.muted}>{text.length}/280</Text><Pressable accessibilityRole="button" disabled={disabled} onPress={post} style={[s.button,disabled && s.disabled]}><Text style={s.buttonText}>{posting ? 'Posting…' : 'Post message ↗'}</Text></Pressable></View>
      <Text style={s.small}>Shared class demo. Everyone with the API link can read and post. Use demo messages only.</Text>
    </View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!!notice && <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text>}
    <View style={s.row}><Text style={s.heading}>On the board <Text style={s.count}>{messages.length}</Text></Text><Pressable accessibilityRole="button" disabled={loading || posting} onPress={refresh}><Text style={s.refresh}>{loading ? 'Loading…' : 'Refresh ↻'}</Text></Pressable></View>
    {loading && <ActivityIndicator color="#246447" />}
    {!loading && !error && messages.length === 0 && <View style={s.empty}><Text style={s.heading}>The first word is yours.</Text><Text style={s.subtitle}>Post a message to get the board started.</Text></View>}
    {messages.map(m => <View key={m.id} style={s.note}><View style={s.row}><Text style={s.author}>{m.name}</Text><Text style={s.small}>{new Date(m.createdAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</Text></View><Text selectable style={s.body}>{m.text}</Text></View>)}
    <Text style={s.footer}>Made for small conversations · Latest 100 messages</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#f4f3ed'},flex:{flex:1},page:{width:'100%',maxWidth:680,alignSelf:'center',padding:24,paddingTop:42,paddingBottom:48,gap:18},eyebrow:{fontSize:11,letterSpacing:2,color:'#52675b',fontWeight:'700'},title:{fontSize:43,fontWeight:'800',letterSpacing:-2,color:'#203b2e'},dot:{color:'#d28b40'},subtitle:{fontSize:16,lineHeight:24,color:'#667169'},card:{backgroundColor:'#fff',padding:22,borderRadius:22,gap:12,borderWidth:1,borderColor:'#e3e7df'},heading:{fontSize:20,fontWeight:'700',color:'#203b2e'},label:{fontSize:13,fontWeight:'600',color:'#46574c'},input:{backgroundColor:'#f8f9f5',borderWidth:1,borderColor:'#dce2d8',borderRadius:12,padding:14,fontSize:16,color:'#253e30'},message:{minHeight:110,textAlignVertical:'top'},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},muted:{color:'#737d75',fontSize:13},button:{backgroundColor:'#285e43',paddingHorizontal:20,paddingVertical:14,borderRadius:12},disabled:{opacity:0.45},buttonText:{color:'#fff',fontWeight:'700',fontSize:15},small:{color:'#6b766e',fontSize:11,lineHeight:17},error:{color:'#973c35',backgroundColor:'#fcece7',padding:14,borderRadius:12},notice:{color:'#285e43'},count:{color:'#7b867a',fontSize:15},refresh:{color:'#285e43',fontSize:14,fontWeight:'700',paddingVertical:12},empty:{padding:26,gap:8,borderWidth:1,borderStyle:'dashed',borderColor:'#cbd4c7',borderRadius:16},note:{padding:20,gap:12,borderRadius:16,backgroundColor:'#fffdf6',borderWidth:1,borderColor:'#e6e1d1'},author:{fontSize:14,fontWeight:'700',color:'#28523b'},body:{fontSize:17,lineHeight:25,color:'#344339'},footer:{textAlign:'center',color:'#7b837b',fontSize:11,marginTop:16}});
