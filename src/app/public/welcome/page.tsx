"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { Fingerprint, Handshake, Menu, Upload, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

const partnerFormSchema = z.object({
	email: z.string().email("Email invalide"),
	phone: z
		.string()
		.regex(
			/^\+225\s?0[1-9]\d{8}$/,
			"Le numéro doit être au format +225 0XXXXXXXXX",
		),
	cniRecto: z.string().min(1, "Le recto de la CNI est requis"),
	cniVerso: z.string().min(1, "Le verso de la CNI est requis"),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const Links = [
	{ title: "Support Technique", href: "#" },
	{ title: "Site web", href: "https:\\merute.dev" },
];

export default function Welcome() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [cniRecto, setCniRecto] = useState<string | null>(null);
	const [cniVerso, setCniVerso] = useState<string | null>(null);
	const rectoInputRef = useRef<HTMLInputElement>(null);
	const versoInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<PartnerFormValues>({
		resolver: zodResolver(partnerFormSchema),
		defaultValues: {
			email: "",
			phone: "+225 ",
			cniRecto: "",
			cniVerso: "",
		},
	});

	const originalReset = form.reset;
	form.reset = () => {
		originalReset({
			email: "",
			phone: "+225 ",
			cniRecto: "",
			cniVerso: "",
		});
		setCniRecto(null);
		setCniVerso(null);
		if (rectoInputRef.current) rectoInputRef.current.value = "";
		if (versoInputRef.current) versoInputRef.current.value = "";
	}

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
	} = form;

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		side: "recto" | "verso",
	) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB max
				setError(side === "recto" ? "cniRecto" : "cniVerso", {
					type: "manual",
					message: "Le fichier ne doit pas dépasser 5MB",
				});
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				if (side === "recto") {
					setCniRecto(result);
					setValue("cniRecto", result);
				} else {
					setCniVerso(result);
					setValue("cniVerso", result);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = (side: "recto" | "verso") => {
		if (side === "recto") {
			setCniRecto(null);
			setValue("cniRecto", "");
			if (rectoInputRef.current) rectoInputRef.current.value = "";
		} else {
			setCniVerso(null);
			setValue("cniVerso", "");
			if (versoInputRef.current) versoInputRef.current.value = "";
		}
	};

	const onSubmit = async (data: PartnerFormValues) => {
		try {
			// Simulation d'un appel API
			await new Promise((resolve) => setTimeout(resolve, 1500));
			console.log("Données du formulaire:", data);
			toast.success("Votre demande a été envoyée avec succès !");
		} catch (error) {
			toast.error("Une erreur est survenue lors de l'envoi du formulaire");
		}
	};

	return (
		<div className="flex flex-1 relative min-h-screen">
			{/* Image de fond floutée globale */}
			<div className="fixed inset-0 z-0">
				<Image
					src="/pictures/login.webp"
					fill
					className="object-cover object-center"
					alt="Background"
					priority
					quality={100}
				/>
				{/* Overlay avec flou et gradient */}
				<div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-b from-white/60 to-white/40" />
			</div>

			<div className="flex flex-col min-h-screen w-full relative overflow-hidden">
				{/* Navbar avec fond semi-transparent */}
				<div className="h-16 md:h-20 border-b shadow-sm flex w-full relative z-20 bg-white/80 backdrop-blur-md">
					<div className="w-full px-4 md:w-10/12 items-center flex mx-auto">
						<div className="flex w-full md:w-2/12 h-full items-center">
							<Image
								src="/pictures/logo.png"
								className="w-8 h-8 md:w-10 md:h-10"
								alt=""
								width={1000}
								height={1000}
							/>
						</div>

						{/* Menu pour desktop */}
						<div className="hidden md:flex w-10/12 h-full space-x-8 items-center justify-end">
							{Links.map((link) => (
								<Link
									className="text-[13px] font-medium hover:text-primary transition-colors"
									key={link.href}
									href={link.href}
								>
									<span className="uppercase tracking-wide">{link.title}</span>
								</Link>
							))}
						</div>

						{/* Bouton menu pour mobile */}
						<div className="flex md:hidden ml-auto">
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="p-2 z-50 relative"
								aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
							>
								<Menu className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>

				{/* Menu mobile avec animation */}
				<div
					className={`fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
						isMenuOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="px-4 py-20 space-y-2">
						{Links.map((link) => (
							<Link
								className="block text-[13px] hover:text-primary transition-colors py-2"
								key={link.href}
								href={link.href}
								onClick={() => setIsMenuOpen(false)}
							>
								<span className="uppercase tracking-wide font-medium">
									{link.title}
								</span>
							</Link>
						))}
					</div>
				</div>

				{/* Overlay sombre quand le menu est ouvert */}
				{isMenuOpen && (
					<div
						className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
						onClick={() => setIsMenuOpen(false)}
					/>
				)}

				{/* Section Héro */}
				<section className="flex-grow flex items-center justify-center relative z-10 px-4">
					<div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 md:gap-12 items-center">
						{/* Image - Maintenant en premier sur mobile */}
						<div className="relative aspect-square rounded-md md:aspect-[4/3] w-4/5 md:w-full mx-auto order-first md:order-last">
							<Image
								fill
								className="object-contain drop-shadow-xl"
								alt="Application mobile Merute Pay"
								src="/pictures/login.webp"
								priority
							/>
						</div>

						{/* Texte et boutons */}
						<div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
							<h1 className="text-3xl md:text-4xl leading-7 font-bold text-gray-900 leading-tight">
								Simplifiez vos paiements avec{" "}
								<span className="text-primary uppercase">Merute Pay</span>
							</h1>
							<p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
								Notre application sécurisée vous permet d'effectuer des
								paiements instantanés et de gérer votre argent en toute
								simplicité.
							</p>
							<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
								<Dialog>
									<DialogTrigger asChild>
										<button className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-sm transition-colors">
										<Fingerprint size={18} className="mr-2" />
											Connexion
										</button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-md">
										<DialogHeader>
											<DialogTitle className="text-center">
												Scanner pour vous connecter
											</DialogTitle>
										</DialogHeader>
										<div className="flex flex-col items-center space-y-6 py-4">
											<p className="text-gray-600 text-sm text-center">
												Ouvrez l'application Merute Pay et scannez ce QR code
												pour vous connecter à votre compte
											</p>
											<div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 shadow-inner">
												<QRCodeSVG
													value="https://merute.dev"
													size={200}
													level="H"
													includeMargin={true}
													imageSettings={{
														src: "/pictures/logo.png",
														x: undefined,
														y: undefined,
														height: 40,
														width: 40,
														excavate: true,
													}}
												/>
											</div>
											<div className="flex items-center gap-2 text-sm text-gray-500">
												<div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
												<p className="font-medium">
													Actualisation automatique toutes les 5 minutes
												</p>
											</div>
										</div>
									</DialogContent>
								</Dialog>
								<Dialog onOpenChange={(open) => {
									if (!open) {
										form.reset();
									}
								}}>
									<DialogTrigger asChild>
										<button className="inline-flex border-2 border-neutral-700 items-center justify-center px-6 py-2.5 text-sm font-medium text-neutral-700 rounded-sm bg-white/50 hover:bg-white/70 backdrop-blur-sm transition-colors">
											<Handshake size={18} className="mr-2" />
											Devenir partenaire
										</button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-md">
										<DialogHeader>
											<DialogTitle>Devenir partenaire Merute Pay</DialogTitle>
										</DialogHeader>
										<Form {...form}>
											<form
												onSubmit={handleSubmit(onSubmit)}
												className="space-y-4 py-4"
											>
												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Email</FormLabel>
															<FormControl>
																<Input
																	placeholder="votre@email.com"
																	className="bg-white/50 backdrop-blur-sm"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="phone"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Numéro de téléphone</FormLabel>
															<FormControl>
																<Input
																	placeholder="+225 0700000000"
																	className="bg-white/50 backdrop-blur-sm"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<div className="space-y-4">
													<Label>Pièce d'identité (Recto/Verso)</Label>
													<div className="grid grid-cols-2 gap-4">
														{/* Upload Recto */}
														<FormField
															control={form.control}
															name="cniRecto"
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<div
																			onClick={() =>
																				rectoInputRef.current?.click()
																			}
																			className="relative border-2 border-dashed rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer group"
																		>
																			<Input
																				ref={rectoInputRef}
																				type="file"
																				className="hidden"
																				accept="image/*"
																				onChange={(e) =>
																					handleFileChange(e, "recto")
																				}
																			/>
																			{cniRecto ? (
																				<div className="relative">
																					<img
																						src={cniRecto}
																						alt="Recto CNI"
																						className="w-full h-32 object-cover rounded-lg"
																					/>
																					<button
																						type="button"
																						onClick={(e) => {
																							e.stopPropagation();
																							removeImage("recto");
																						}}
																						className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
																					>
																						<X className="h-4 w-4" />
																					</button>
																				</div>
																			) : (
																				<div className="flex flex-col items-center gap-2 text-sm text-gray-600">
																					<Upload className="h-8 w-8" />
																					<span>Recto</span>
																				</div>
																			)}
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Upload Verso */}
														<FormField
															control={form.control}
															name="cniVerso"
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<div
																			onClick={() =>
																				versoInputRef.current?.click()
																			}
																			className="relative border-2 border-dashed rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer group"
																		>
																			<Input
																				ref={versoInputRef}
																				type="file"
																				className="hidden"
																				accept="image/*"
																				onChange={(e) =>
																					handleFileChange(e, "verso")
																				}
																			/>
																			{cniVerso ? (
																				<div className="relative">
																					<img
																						src={cniVerso}
																						alt="Verso CNI"
																						className="w-full h-32 object-cover rounded-lg"
																					/>
																					<button
																						type="button"
																						onClick={(e) => {
																							e.stopPropagation();
																							removeImage("verso");
																						}}
																						className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
																					>
																						<X className="h-4 w-4" />
																					</button>
																				</div>
																			) : (
																				<div className="flex flex-col items-center gap-2 text-sm text-gray-600">
																					<Upload className="h-8 w-8" />
																					<span>Verso</span>
																				</div>
																			)}
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
													<p className="text-xs text-gray-500 text-center">
														Format accepté : JPG, PNG (max 5MB)
													</p>
												</div>
												<Button type="submit" className="w-full">
													Envoyer ma demande
												</Button>
											</form>
										</Form>
									</DialogContent>
								</Dialog>
							</div>
							<div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
								<button className="inline-flex items-center px-4 py-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm rounded-sm transition-colors">
									<svg className="w-5 h-5" viewBox="0 0 512 512">
										<path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z" />
									</svg>
									<span className="ml-2 text-sm font-medium">Google Play</span>
								</button>
								<button className="inline-flex items-center px-4 py-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm rounded-sm transition-colors">
									<svg className="w-5 h-5" viewBox="0 0 305 305">
										<path d="M40.74 112.12c-25.79 44.74-9.4 112.65 19.12 153.82C74.09 286.52 88.5 305 108.24 305c.37 0 .74 0 1.13-.02 9.27-.37 15.97-3.23 22.45-5.99 7.27-3.1 14.8-6.3 26.6-6.3 11.22 0 18.39 3.1 25.31 6.1 6.83 2.95 13.87 6 24.26 5.81 22.23-.41 35.88-20.35 47.92-37.94a168.18 168.18 0 0021-43l.09-.28a2.5 2.5 0 00-1.33-3.06l-.18-.08c-3.92-1.6-38.26-16.84-38.62-58.36-.34-33.74 25.76-51.6 31-54.84l.24-.15a2.5 2.5 0 00.7-3.51c-18-26.37-45.62-30.34-56.73-30.82a50.04 50.04 0 00-4.95-.24c-13.06 0-25.56 4.93-35.61 8.9-6.94 2.73-12.93 5.09-17.06 5.09-4.64 0-10.67-2.4-17.65-5.16-9.33-3.7-19.9-7.9-31.1-7.9l-.79.01c-26.03.38-50.62 15.27-64.18 38.86z" />
									</svg>
									<span className="ml-2 text-sm font-medium">App Store</span>
								</button>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
