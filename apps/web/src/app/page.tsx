import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">📚</span>
                        <span className="text-xl font-bold">Thesis Assistant</span>
                    </div>
                    <nav className="flex gap-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Đăng ký
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <main className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Viết đồ án, luận văn với{' '}
                        <span className="text-blue-600">format chuẩn 100%</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Hệ thống hỗ trợ sinh viên viết đồ án tốt nghiệp, khóa luận với định dạng
                        chuẩn theo quy định của từng trường, khoa. Tích hợp AI gợi ý nội dung.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition shadow-lg"
                        >
                            Bắt đầu ngay
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-3 bg-white text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-50 transition border shadow"
                        >
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                            📝
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Soạn đề cương thông minh</h3>
                        <p className="text-gray-600">
                            AI gợi ý cấu trúc chương, mục phù hợp với đề tài và loại tài liệu của bạn.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                            ✅
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Format chuẩn 100%</h3>
                        <p className="text-gray-600">
                            Xuất file Word với đúng font, cỡ chữ, lề, đánh số theo quy định từng trường.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                            🤖
                        </div>
                        <h3 className="text-xl font-semibold mb-2">AI hỗ trợ viết</h3>
                        <p className="text-gray-600">
                            Gợi ý nội dung, viết lại văn phong học thuật, không lo format.
                        </p>
                    </div>
                </div>

                {/* Supported Schools */}
                <div className="mt-20 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                        Hỗ trợ format theo quy định
                    </h2>
                    <div className="flex justify-center gap-8 flex-wrap">
                        <div className="bg-white px-6 py-3 rounded-lg shadow border">
                            🏛️ Đại học Thủy lợi
                        </div>
                        <div className="bg-gray-100 px-6 py-3 rounded-lg text-gray-500">
                            + Nhiều trường khác sắp ra mắt
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-20 py-8 bg-white">
                <div className="container mx-auto px-4 text-center text-gray-500">
                    <p>© 2024 Thesis Assistant. Made with ❤️ for Vietnamese students.</p>
                </div>
            </footer>
        </div>
    );
}
